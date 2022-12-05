const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
    type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
    }

    input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
    }

    type RootQuery {
        events: [Event!]!
    }

    type RootMutation {
         createEvent(eventInput: EventInput): Event
    }
       schema {
        query: RootQuery
        mutation: RootMutation
       }
    `),
    rootValue: {
        events: async () => {
            try {
                const events = await Event.find();
                return events.map(event => {
                    return { ...event._doc, _id: event.id };
                });
            } catch (err) {
                throw err;
            }
        },
        createEvent: async (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date)
            });
           try {
                const result = await event.save();
                console.log(result);
                return { ...result._doc, _id: result._doc._id.toString() };
            } catch (err) {
                console.log(err);
                throw err;
            }
            
        }
    },
    graphiql: true,
}));

mongoose.connect('mongodb+srv://lester:XgRi7xtTi2Cg8JD0@cluster0.5ewcuzr.mongodb.net/booking-api?retryWrites=true&w=majority')
.then(() => {
    app.listen(3000);
}).catch(err => {
    console.log(err);
});
