const express = require('express');
const {createListing, getHouses,getHouse,edit, deleteHouse, addFavourite ,removeFavourite, getFavourites, approveListing, rejectListing, pendingListings,getMyListing} =require('../controller/houseController');
const { authMidware } = require('../middleware/authmidware');
const { checkAccess } = require('../middleware/authorization');

const route = express.Router();

route.post('/createListing', authMidware, checkAccess(['seller','admin']) ,createListing );
route.get('/getHouses', getHouses);
route.get('/single/:id', getHouse);
route.get('/getMyListing', authMidware, checkAccess(['seller','admin']), getMyListing);
// router.post('/view/:id', recordPropertyView);
route.put('/edit/:id', authMidware,checkAccess(['seller','admin']), edit);
route.delete('/deleteHouse/:id', authMidware, checkAccess(['admin',"seller"]), deleteHouse);
route.post('/addFavourite',authMidware, addFavourite);
route.delete('/removeFavourite',authMidware, removeFavourite);
route.get('/allFavourites', authMidware, getFavourites);
route.put('/approveListing/:id',authMidware, checkAccess(["admin"]) ,approveListing);
route.get('/pending', pendingListings)
route.delete('/rejectListing',authMidware, checkAccess(["admin"]), rejectListing);



module.exports = route;