const dynamoose = require('dynamoose');
const { Schema } = dynamoose;

const consentSchema = new Schema({
    cust_id: {
        type: String,
        hashKey: true
    },
    cmId: {
        type: String,
        default: ''
    },
    requestId: {
        type: String,
        default: null
    },
    consentRequestId: {
        type: String,
        default: null
    },
    fetchId: {
        type: String,
        default: null
    },
    linked: {
        type: String,  //REQUESTED,GRANTED,DENIED,DOWN
        default: 'REQUESTED'
    },
    accessToken: {
        type: String,
    },
}, { timestamps: true });

const custSchema = new Schema({
    cust_id: {
        type: String,
        hashKey: true
    },
    cmid: {
        type: String,
        default: ''
    },
    linked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

exports.Cust = dynamoose.model('healthathon-cust-dev', custSchema, { create: false });
exports.Consent = dynamoose.model('healthathon-consent-dev', consentSchema, { create: false });