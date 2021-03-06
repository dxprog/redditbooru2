var Item = require('../models/cache/item'),
    Image = require('../models/db/image'),
    Response = require('../lib/Response');

exports.api = function(req, res) {
    var response = new Response(req, res),
        q = req.query,
        options = {
            keywords: q.keywords || null,
            sources: q.sources || 1, // default to awwnime; don't want to be serving up porn to everybody by default
            postId: q.postId || null,
            externalId: q.externalId || null,
            limit: q.limit || 25,
            afterDate: q.afterDate || null,
            minDate: q.minDate || null,
            maxDate: q.maxDate || null,
            user: q.user || null,
            imageUrl: q.imageUri || q.imageUrl || null // retaining old name for BC
        },
        retVal = null,
        start = Date.now(),
        queryMethod = options.imageUrl ? Image.queryByImage : Item.query;

    queryMethod(options).then(function(results) {
        response.writeJSON(results, true);
    }).fail(function(err) {
        console.log(err);
        response.writeJSON({ err: true, msg: err }, true);
    });
};