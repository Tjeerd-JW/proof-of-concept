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

// app.get('/', async function (request, response) {
//     response.render('index.liquid')
// })


app.get('/', async function (request, response) {

  const tweakersResponse = await fetch('https://gathering.tweakers.net/rss/list_topics/105')
  const tweakersResponseXML = await tweakersResponse.text()

  const { format, feed } = parseFeed(tweakersResponseXML)
  // console.log(feed) // Om te debuggen

  response.render('index.liquid', {items: feed.items})
})