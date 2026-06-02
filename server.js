import express from "express";
import { Liquid } from "liquidjs";

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

app.get('/', async function (request, response) {
    response.render('index.liquid')
})