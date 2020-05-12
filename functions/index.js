/* eslint-disable promise/always-return */
const functions = require('firebase-functions');
const https = require('https');
// const cors = require('cors')({origin: true});
const stripe = require('stripe')('sk_test_PnmpVoBbf5iX1l5dD1R8WHgk002ccLA1ZA');
const info = functions.config().info;
const zipTaxToken = 'a5d245185b8de3e8747d490cc2901320'

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.payWithStripe = functions.https.onRequest((request, response) => {
    // Set your secret key: remember to change this to your live secret key in production
    // See your keys here: https://dashboard.stripe.com/account/apikeys

    response.set('Access-Control-Allow-Origin', '*');

    // eslint-disable-next-line promise/catch-or-return
    stripe.charges.create({
        amount: request.body.amount * 100,
        currency: request.body.currency,
        source: request.body.source,
    }).then((charge) => {
        // asynchronously called
        response.send(charge);
    })
    .catch(err =>{
        response.send(err);
    });

});

exports.getTaxRate = functions.https.onRequest((request, response) => {
    var data;
    response.set('Access-Control-Allow-Origin', '*');
    https.get('https://api.zip-tax.com/request/v40?key=YSQJxyvt5NG3OWgB&postalcode=90264', (res) => {
        res.on('data', (d) => {
            var buffer = Buffer.from(d);
            data = buffer.toString('utf-8');
        });

        res.on('end', () => {
            response.send(data);
        })
    }).on('error', (e) => {
        console.log(e);
    });
})