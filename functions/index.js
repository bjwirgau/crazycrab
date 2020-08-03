/* eslint-disable promise/always-return */
const functions = require('firebase-functions');
const https = require('https');
const stripe = require('stripe')(functions.config().stripe.token);
const sgMail = require('@sendgrid/mail');

const SENDGRID_API_KEY = functions.config().sendgrid.key;
sgMail.setApiKey(SENDGRID_API_KEY);
// sgMail.setSubstitutionWrappers('{{','}}');

const ZIP_TAX_KEY = functions.config().ziptax.key;

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
    response.set('Access-Control-Allow-Headers', '*');

    // eslint-disable-next-line promise/catch-or-return
    stripe.charges.create({
        amount: request.body.amount,
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
    console.log(request);
    https.get(`https://api.zip-tax.com/request/v40?key=${ZIP_TAX_KEY}&postalcode=${request.param('zipCode')}`, (res) => {
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
});

exports.sendConfirmation = functions.https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Headers', '*');

    const userFirstname = request.param('firstname');
    const userLastname = request.param('lastname');
    const userEmail = request.param('recipientEmail');
    const orderDate = request.param('orderDate');
    const orderSubtotal = request.param('subtotal');
    const orderTax = request.param('tax');
    const orderGrandtotal = request.param('grandtotal');
    
    const orderItems = request.param('orderItems');
    const parsedOrderItems = JSON.parse(orderItems);
    console.log(parsedOrderItems);

    const msg = {
        to: userEmail,
        from: 'customerservice@crazy-crab.com',
        subject: 'Order Confirmation',
        templateId: 'd-65e5d8dbd0974b1a94d569ce881746cd',
        dynamicTemplateData: {
            firstname: userFirstname,
            lastname: userLastname,
            email: userEmail,
            orderdate: orderDate,
            subtotal: orderSubtotal,
            tax: orderTax,
            grandtotal: orderGrandtotal,
            orderItems: parsedOrderItems
        }
    };

    console.log(msg);

    sgMail.send(msg)
    .then(() => {
        console.log('Email Sent!')
        response.send(msg)
    })
    .catch( error => {  
        // Log friendly error
        console.error(error);
    
        if (error.response) {
          // Extract error msg
          const {message, code, response} = error;
    
          // Extract response msg
          const {headers, body} = response;
    
          console.error(body);
          response.send(body);
        }
    });
})

