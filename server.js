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

function randomNumber() {
  return Math.floor(Math.random() * 750000);
}

const gameCategories = [
  {
  id: 12,
  title: 'Hardware en spielerij algemeen',
  topics: randomNumber(),
  reactions: randomNumber()
},
{
  id: 105,
  title: 'Actie, adventure en platform games',
  topics: randomNumber(),
  reactions: randomNumber()
},
{
  id: 75,
  title: 'racing',
  topics: randomNumber(),
  reactions: randomNumber()
},
{
  id: 106,
  title: 'Role-playing games',
  topics: randomNumber(),
  reactions: randomNumber()
},
{
  id: 104,
  title: 'Shooters',
  topics: randomNumber(),
  reactions: randomNumber()
},
{
  id: 107,
  title: 'Strategy games',
  topics: randomNumber(),
  reactions: randomNumber()
},
{
  id: 108,
  title: 'Sport en simulatie games',
  topics: randomNumber(),
  reactions: randomNumber()
},
{
  id: 53,
  title: 'Spielerij - problemen en vragen',
  topics: randomNumber(),
  reactions: randomNumber()
}
]

app.get('/', async function (request, response) {
    response.render('index.liquid', {
      gameCategories: gameCategories
    })
})

app.get('/categorie/:id', async function (request, response) {
  const rssResponse = await fetch(`${baseURL}list_topics/${request.params.id}`)
  const responseXML = await rssResponse.text()
  const { format, feed } = parseFeed(responseXML)

  response.render('category.liquid', {items: feed.items})
  
})

app.get('/topic/:id', async function (request, response) {
  const rssResponse = await fetch(`${baseURL}list_messages/${request.params.id}`)
  const responseXML = await rssResponse.text()
  const { format, feed } = parseFeed(responseXML)

  response.render('topic.liquid', {items: feed.items})
  
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
