import express from "express";
import { Liquid } from "liquidjs";
import { parseFeed } from 'feedsmith'
import { JSDOM } from 'jsdom'

const app = express();


const scrapeAndUpdateTweakers = async function () {
  const tweakersActiveTopicsResponse = await fetch('https://gathering.tweakers.net/rss/list_activetopics')
  const tweakersActiveTopicsResponseXML = await tweakersActiveTopicsResponse.text()
  const { feed: tweakersActiveTopicsFeed } = parseFeed(tweakersActiveTopicsResponseXML)
  const tweakersLastPoster = tweakersActiveTopicsFeed.items[0].description.substring(13 + tweakersActiveTopicsFeed.items[0].description.indexOf('Last poster: '), tweakersActiveTopicsFeed.items[0].description.indexOf(' at '))
  const directusUserResponse = await fetch('https://fdnd-agency.directus.app/items/tweakers_users?' + new URLSearchParams({ 'filter[username]': tweakersLastPoster }))
  const directusUserResponseJSON = await directusUserResponse.json()
  const tweakersLastPosterProfileResponse = await fetch('https://tweakers.net/gallery/' + tweakersLastPoster)
  const tweakersLastPosterProfileResponseHTML = await tweakersLastPosterProfileResponse.text()
  const { document: tweakersLastPosterProfileResponseDOM } = (new JSDOM(tweakersLastPosterProfileResponseHTML)).window
  const tweakersLastPosterProfileLink = tweakersLastPosterProfileResponseDOM.querySelector('a[href^="https://gathering.tweakers.net/forum/find/poster/"]')
  const tweakersLastPosterPostCount = tweakersLastPosterProfileLink.textContent.replace(/\./g, '')
  if (directusUserResponseJSON.data.length == 1) {
    await fetch('https://fdnd-agency.directus.app/items/tweakers_users', {
      method: 'PATCH',
      body: JSON.stringify({
        number_of_posts: tweakersLastPosterPostCount
      }),
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    })
  } else {
    const tweakersLastPosterProfileRegistered = tweakersLastPosterProfileResponseDOM.querySelector('.registered').textContent
    const tweakersLastPosterProfileRegisteredDateParts = tweakersLastPosterProfileRegistered.substring(18, tweakersLastPosterProfileRegistered.indexOf(', laatste')).split(' ')
    const months = { januari: '01', februari: '02', maart: '03', april: '04', mei: '05', juni: '06', juli: '07', augustus: '08', september: '09', oktober: 10, november: 11, december: 12 }
    const tweakersLastPosterProfileRegisteredDate = tweakersLastPosterProfileRegisteredDateParts[2] + '-' + months[tweakersLastPosterProfileRegisteredDateParts[1]] + '-' + tweakersLastPosterProfileRegisteredDateParts[0].padStart(2, '0')
    await fetch('https://fdnd-agency.directus.app/items/tweakers_users', {
      method: 'POST',
      body: JSON.stringify({
        member_since: tweakersLastPosterProfileRegisteredDate,
        username: tweakersLastPoster,
        forum_id: tweakersLastPosterProfileLink.getAttribute('href').substring(13 + tweakersLastPosterProfileLink.getAttribute('href').indexOf('/find/poster/')),
        number_of_posts: tweakersLastPosterPostCount
      }),
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    })
  }
}

scrapeAndUpdateTweakers()


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
      messagesPerTopic: topics > 0 ? +(messages / topics).toFixed(1) : 0
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
