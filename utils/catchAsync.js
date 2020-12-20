module.exports = func => { //pass in function
    return (req, res, next) => { //return another function which can throw error
        func(req, res, next).catch(next); // if error is thrown pass to our err handle in app.js
    }
}
//to wrap aysnc functions