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

    return {
      title: item.title,
      link: item.link,//Gebruik regex om aantal topics/messages te vinden
      topics: Number(description.match(/Topics:\s*(\d+)/)?.[1] ?? 0),
      messages: Number(description.match(/Messages:\s*(\d+)/)?.[1] ?? 0),
    };
  });

  items.sort(function (a, b) {
    if (a.messages < b.messages) {
      return 1;
    } else if (a.messages > b.messages) {
      return -1;
    }
    return 0;
  })

  response.render('index.liquid', { items });
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


// app.get('/', async function (request, response) {

//   const tweakersResponse = await fetch('https://gathering.tweakers.net/rss/list_topics/105')
//   const tweakersResponseXML = await tweakersResponse.text()

//   const { format, feed } = parseFeed(tweakersResponseXML)
//   // console.log(feed) // Om te debuggen

//   response.render('index.liquid', {items: feed.items})
// })

// app.get('/', async function (request, response) {

//   const tweakersResponse = await fetch('https://gathering.tweakers.net/rss/list_topics/105')
//   const tweakersResponseXML = await tweakersResponse.text()

//   const { format, feed } = parseFeed(tweakersResponseXML)
 

//   const items = []
//   for (const item of feed.items) {
//     items.push({
//       title: item.title,
//       link: item.link,
//       replies: Number(item.description.substring(9, item.description.indexOf('\n')))
//     })
//   }

//   items.sort(function(a, b) {
//    if (a.replies < b.replies) {
//     return 1;
//    } else if (a.replies > b.replies) {
//     return -1;
//    }
//    return 0;
//   })

//   console.log(items)

//   response.render('index.liquid', {items: items})
// })
