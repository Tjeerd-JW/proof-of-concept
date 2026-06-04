import express from "express";
import { Liquid } from "liquidjs";
import { parseFeed } from 'feedsmith'

const app = express();

app.use(express.urlencoded({ extended: true }))

app.use(express.static("public"));

const engine = new Liquid();
app.engine("liquid", engine.express());

app.set("views", "./views");

app.set("port", process.env.PORT || 8000);

// Start Express op, gebruik daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  console.log(`Project draait via http://localhost:${app.get('port')}/\n\nGleep glorp hij staat aan`)
})

const baseURL = 'https://gathering.tweakers.net/rss/'

app.get('/', async (request, response) => {

  const rssResponse = await fetch(baseURL);
  const responseXML = await rssResponse.text();

  const { feed } = parseFeed(responseXML);

  const items = feed.items.map(item => {
    const description = item.description ?? '';
    //Gebruik regex om aantal topics/messages te vinden
    const topics = Number(description.match(/Topics:\s*(\d+)/)?.[1] ?? 0);
    const messages = Number(description.match(/Messages:\s*(\d+)/)?.[1] ?? 0);

    return {
      title: item.title,
      link: item.link,
      topics,
      messages,
      messagesPerTopic: topics > 0 ? +(messages / topics).toFixed(1): 0
    };
  });

  items.sort(function (a, b) {
    if (a.messagesPerTopic < b.messagesPerTopic) {
      return 1;
    } else if (a.messagesPerTopic > b.messagesPerTopic) {
      return -1;
    }
    return 0;
  })


  const totalTopics = items.reduce((sum, c) => sum + c.topics, 0);
  const totalMessages = items.reduce((sum, c) => sum + c.messages, 0);
  const averagePerTopic = totalMessages / totalTopics

  const formattedTopics = totalTopics.toLocaleString('nl-NL');
  const formattedMessages = totalMessages.toLocaleString('nl-NL');

  console.log(formattedMessages);

  response.render('index.liquid', {
    items: items,
    totalTopics: formattedTopics,
    totalMessages: formattedMessages,
    averagePerTopic: averagePerTopic
  });
});

app.get('/categorie/:id', async function (request, response) {
  const rssResponse = await fetch(`${baseURL}list_topics/${request.params.id}`)
  const responseXML = await rssResponse.text()
  const { format, feed } = parseFeed(responseXML)

  response.render('category.liquid', {
    items: feed.items,

  })

})

app.get('/topic/:id', async function (request, response) {
  const rssResponse = await fetch(`${baseURL}list_messages/${request.params.id}`)
  const responseXML = await rssResponse.text()
  const { format, feed } = parseFeed(responseXML)

  response.render('topic.liquid', { items: feed.items })

})

app.get('/profile/:name', async function (request, response) {
  const topicsResponse = await fetch(`${baseURL}find/poster/${request.params.name}/topics`)
  const topicsXML = await topicsResponse.text()
  const { feed: topicsFeed } = parseFeed(topicsXML)

  const messagesResponse = await fetch(`${baseURL}find/poster/${request.params.name}/messages`)
  const messagesXML = await messagesResponse.text()
  const { feed: messagesFeed } = parseFeed(messagesXML)


  response.render('profile.liquid', {
    topics: topicsFeed.items,
    messages: messagesFeed.items
  })

})
