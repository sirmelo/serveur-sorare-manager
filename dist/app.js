"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const graphql_request_1 = require("graphql-request");
const app_1 = require("firebase/app");
const database_1 = require("firebase/database");
const firestore_1 = require("firebase/firestore");
const firestore_2 = require("firebase/firestore");
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const cron_1 = require("cron");
const router = express_1.default.Router();
const app1 = (0, express_1.default)();
const port = 3000;
const data = [];
const firebaseConfig = {
    apiKey: "AIzaSyBWJAx66bmvJCQoyX2aCZLlXLgfwyL9sQc",
    authDomain: "betsorare.firebaseapp.com",
    databaseURL: "https://betsorare-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "betsorare",
    storageBucket: "betsorare.appspot.com",
    messagingSenderId: "775300172457",
    appId: "1:775300172457:web:a781127432aeb852d7f7b8"
};
const app = (0, app_1.initializeApp)(firebaseConfig);
const database = (0, database_1.getDatabase)(app);
const db = (0, firestore_1.getFirestore)();
router.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname + '/index.html'));
    //__dirname : It will resolve to your project folder.
});
// ########################  REQUETES  ##############################
// ################################################################
// #########################  REFRESH PLAYERS   ######################
router.get('/players', (res, response) => {
    res;
    // cron.schedule('00 03  * *  *', function() {
    function main() {
        return __awaiter(this, void 0, void 0, function* () {
            const endpoint = 'https://api.sorare.com/graphql';
            const graphQLClient = new graphql_request_1.GraphQLClient(endpoint, {
                headers: {
                    authorization: 'Bearer mtps42938jsQu3-kuE88Z5Bk9-bZzHwvwLAd14-xG4Y',
                    APIKEY: '411b4c69a0cb415c93cabba1abfd650a92dc2b5916d6ff82d837044658c56686f928a96fe86074051eaa53732c236386ac38588504bc1f73ef508c4c422sr128',
                    'content-type': 'application/json'
                },
            });
            const GET_All_PLAYERS = (0, graphql_request_1.gql) `
        query clubs{
        releasedPlayerValues{
            displayName
            draftValue
            slug
        }
        }
        `;
            const GET_PLAYERS = (0, graphql_request_1.gql) `
        query players($slug:String!){
        player(slug: $slug ){
            status{
                playingStatus
              }
              cardSupply{
                season{
                  startYear
                }
                limited
                rare
                superRare
                unique
              }       
            displayName
            slug
            age
            appearances
            position
            pictureUrl
            activeClub{
            country{
                slug
            }
            name
            slug
            pictureUrl
            domesticLeague{
                slug
                name
            }
            }
            activeNationalTeam{
            name
            pictureSecondaryUrl
            }
            allSo5Scores (first:15){
            nodes{
              score	
              detailedScore{
              category
              stat
              totalScore
              }
            }
            }
            gameStats(last:40){
            minsPlayed
            }
            status {
            lastFifteenSo5AverageScore
            lastFiveSo5Appearances
            lastFiveSo5AverageScore
            lastFifteenSo5Appearances
            }
            cards(first:1){
            nodes{
            pictureUrl
            }
            }
            cardSampleUrl(rarity :"limited")

        }
        }`;
            const GET_PRICE = (0, graphql_request_1.gql) `
        query price($slugs:[String!]!){
            cards(slugs:$slugs){
              slug
              pictureUrl
              onSale
                      liveSingleSaleOffer{
                  price
                  priceInFiat{
                    eur}
                  endDate
                }
            }
          }
        `;
            const GET_CARD_RARE = (0, graphql_request_1.gql) `
        query card_rare ($slug:String!){
        player(slug: $slug ){
            cardSampleUrl(rarity:"rare")
            }
        }
        `;
            const GET_CARD_COMMON = (0, graphql_request_1.gql) `
        query card_rare ($slug:String!){
        player(slug: $slug ){
            cardSampleUrl(rarity:"common")
            }
        }
        `;
            const GET_RESULTATS = (0, graphql_request_1.gql) `
        query players($slug:String!){
        player(slug: $slug ){
            allSo5Scores (first:15){
            nodes{
                score
                }
            }
            gameStats(last:15){
            minsPlayed
                }
            }
        }
        `;
            const dbRef = (0, database_1.ref)((0, database_1.getDatabase)());
            const data = yield graphQLClient.request(GET_All_PLAYERS);
            const day = 60 * 60 * 24 * 1000;
            var datatoday = new Date();
            let todate;
            var datatodays = datatoday.setDate(new Date(datatoday).getDate() + 1);
            todate = new Date(datatodays);
            response.send('Derni??re mise ?? jour: ' + Date() + '\n Prochaine mise ?? jour: ' + todate);
            const allPlayers = data.releasedPlayerValues;
            const nbPlayersLicense = allPlayers.length;
            var allPlayersLicence = [];
            let count = -1;
            let variables;
            for (let i = 0; i < nbPlayersLicense; i++) {
                allPlayersLicence.push(allPlayers[i].slug);
            }
            const tabPlayers = allPlayersLicence;
            const nbPlayers = tabPlayers.length;
            //MODIFIER COUNT POUR AUGMENTER TAILLE BDD//////////////////////
            do {
                count += 1;
                let slug = tabPlayers[count];
                variables = {
                    slug: slug,
                };
                try {
                    const playerData = yield graphQLClient.request(GET_PLAYERS, variables);
                    const get_player = playerData.player;
                    const playername = get_player.displayName;
                    if (get_player.activeClub != null) {
                        const age = get_player.age;
                        const position = get_player.position;
                        const playerslug = get_player.slug;
                        console.log(count, playerslug, "etape1");
                        console.log(count, playername, "etape1");
                        if (get_player.status != null && get_player.status.playingStatus != null) {
                            global.statut = get_player.status.playingStatus;
                            ////set(ref(getDatabase(),'/test/clubsReady/' +count+ '/status'),(global.statut));
                        }
                        else {
                            global.statut = "";
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/status'),(global.statut));
                        }
                        ;
                        if (get_player.allSo5Scores.nodes != undefined) {
                            global.allSo5Scores = get_player.allSo5Scores.nodes;
                        }
                        else {
                            global.allSo5Scores = [];
                        }
                        const sl5 = Math.round(get_player.status.lastFiveSo5AverageScore);
                        const sl15 = Math.round(get_player.status.lastFifteenSo5AverageScore);
                        const tj15 = Math.round(((get_player.status.lastFifteenSo5Appearances) / 15) * 100);
                        const tj5 = Math.round(((get_player.status.lastFiveSo5Appearances) / 5) * 100);
                        // /#### A MODIFIER POUR LE SCORE AA########
                        let sdsl5 = 18;
                        let sdsl15 = 18;
                        let saal5 = 18;
                        let saal15 = 18;
                        // /#### A MODIFIER POUR LE SCORE AA########
                        console.log(sl5, sl15, tj5, tj15);
                        console.log(count, "etape2");
                        //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/Maj'),(Date()));
                        //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/country'),("false"));
                        //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/sl5'),(sl5));
                        //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/sl15'),(sl15));
                        //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/tj5'),(tj5));
                        //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/tj15'),(tj15));
                        //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/position'),(position));
                        //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/playerslug'),(playerslug));
                        //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/playername'),(playername));
                        //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/age'),(age));
                        if (get_player.activeClub.domesticLeague != null && get_player.activeClub.domesticLeague.slug != null) {
                            global.leagueslug = get_player.activeClub.domesticLeague.slug;
                            global.teamleague = get_player.activeClub.domesticLeague.name;
                            global.competition = "";
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/teamleague'),(global.teamleague));
                            if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                                global.competition = "champion-europe";
                            }
                            else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leagueslug === "ukrainian-premier-league") {
                                global.competition = "challenger-europe";
                            }
                            else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                                global.competition = "champion-asia";
                            }
                            else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                                global.competition = "champion-america";
                            }
                            else {
                                global.competition = "other";
                            }
                            ;
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/competition'),(global.competition));
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/leagueslug'),(global.leagueslug));
                        }
                        else {
                            global.teamleague = "";
                            global.leagueslug = "";
                            global.competition = "other";
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/teamleague'),(""));
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/competition'),(""));
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/leagueslug'),(""));
                        }
                        if (get_player.activeNationalTeam != null) {
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/nationalteamname'),(get_player.activeNationalTeam.name));
                            global.nationalteamname = get_player.activeNationalTeam.name;
                        }
                        else {
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/nationalteamname'),(""));
                            global.nationalteamname = "";
                        }
                        ;
                        if (get_player.pictureUrl != null) {
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/playerpictureURL'),(get_player.pictureUrl));
                            global.playerpictureURL = get_player.pictureUrl;
                        }
                        else {
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/playerpictureURL'),(""));
                            global.playerpictureURL = "";
                        }
                        ;
                        if (get_player.activeClub != null && get_player.activeClub.pictureUrl != null) {
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/teampictureURL'),(get_player.activeClub.pictureUrl));
                            global.teampictureURL = get_player.activeClub.pictureUrl;
                        }
                        else {
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/teampictureURL'),(""));
                            global.teampictureURL = "";
                        }
                        ;
                        if (get_player.cardSampleUrl != null) {
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardpicturelimited'),(get_player.cardSampleUrl));
                            global.cardpicturelimited = get_player.cardSampleUrl;
                        }
                        else {
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardpicturelimited'),(""));
                            global.cardpicturelimited = "";
                        }
                        ;
                        if (get_player.activeNationalTeam != null && get_player.activeNationalTeam.pictureSecondaryUrl) {
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/nationalteamPicture'),(get_player.activeNationalTeam.pictureSecondaryUrl));
                            global.nationalteamPicture = get_player.activeNationalTeam.pictureSecondaryUrl;
                        }
                        else {
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/nationalteamPicture'),(""));
                            global.nationalteamPicture = "";
                        }
                        ;
                        if (get_player.activeClub != null) {
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/teamname'),(get_player.activeClub.name));
                            global.teamname = get_player.activeClub.name;
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/teamslug'),(get_player.activeClub.slug));
                            global.teamslug = get_player.activeClub.slug;
                        }
                        else {
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/teamslug'),(""));
                            global.teamname = "";
                            global.teamslug = "";
                        }
                        ;
                        // /#### A MODIFIER POUR LE SCORE AA########
                        console.log(count, "etape3");
                        //   let detailScore: any[] =[];
                        //   let detailScore5: any[] =[];
                        //   let detailScore15: any[] =[];
                        //   const reducer = (previousValue: number, currentValue: number) => previousValue + currentValue;
                        //   if(get_player.allSo5Scores.nodes.length===0){
                        //     sdsl5=0;
                        //     sdsl15=0;
                        //     saal15=0;
                        //     saal5=0;  
                        // }else{
                        //   if (get_player.allSo5Scores.nodes.length < get_player.status.lastFiveSo5Appearances){
                        //     global.nbApparence5=get_player.allSo5Scores.nodes.length
                        //   }else{
                        //     global.nbApparence5=get_player.status.lastFiveSo5Appearances
                        //   }
                        //   for (let j = 0; j < global.nbApparence5; j++)
                        //     {
                        //       detailScore5.push(get_player.allSo5Scores.nodes[j].detailedScore[0].totalScore)
                        //       console.log(detailScore5)
                        //     }; 
                        //       sdsl5 = Math.round(detailScore5.reduce(reducer)/+global.nbApparence5);
                        //       saal5 = +sl5-(sdsl5);
                        //       console.log(sl5,sdsl5,saal5)
                        //   if (get_player.allSo5Scores.nodes.length < get_player.status.lastFifteenSo5Appearances){
                        //     global.nbApparence15=get_player.allSo5Scores.nodes.length
                        //   }else{
                        //     global.nbApparence15=get_player.status.lastFifteenSo5Appearances
                        //   }
                        //   for (let j = 0; j < global.nbApparence15; j++) 
                        //   {
                        //     detailScore15.push(get_player.allSo5Scores.nodes[j].detailedScore[0].totalScore)
                        //     console.log(detailScore15)
                        //   };
                        //   sdsl15 = Math.round(detailScore15.reduce(reducer)/+global.nbApparence15s);
                        //   saal15 = +sl15-(sdsl15);
                        //   console.log(sl15,sdsl15,saal15)                  
                        // }
                        // /#### A MODIFIER POUR LE SCORE AA########
                        console.log(count, "etape3-2");
                        //Notation saalx & sdslx
                        //#######################
                        const baremeNoteSadx = [[0, -1], [0.5, 5], [1, 8], [1.5, 10], [2, 15], [2.5, 18], [3, 22], [3.5, 25], [4, 35], [4.5, 50], [5, 99]];
                        //Notation Tjx
                        //#######################
                        const baremeNoteTjx = [[0, -1], [0.5, 46], [1, 51], [1.5, 56], [2, 61], [2.5, 66], [3, 71], [3.5, 76], [4, 81], [4.5, 86], [5, 99]];
                        //Notation Slx
                        const baremeNoteSlx = [[0, -1], [0.5, 40], [1, 50], [1.5, 55], [2, 60], [2.5, 65], [3, 70], [3.5, 75], [4, 80], [4.5, 85], [5, 99]];
                        //Notation AGE
                        //#######################
                        const baremeNoteAge = [[5, -1], [4, 22], [3, 25], [2, 28], [1, 35], [0, 45]];
                        let notebetdsl5 = 0;
                        let notebetSl5 = 0;
                        let notebetaal5 = 0;
                        let notebetTj5 = 0;
                        let notebetdsl15 = 0;
                        let notebetSl15 = 0;
                        let notebetaal15 = 0;
                        let notebetTj15 = 0;
                        let notebetAge = 0;
                        for (let l = 0; l < 11; l++) {
                            if (sdsl5 > baremeNoteSadx[l][1]) {
                                notebetdsl5 = baremeNoteSadx[l][0];
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetdsl5'),(notebetdsl5));
                            }
                            ;
                            if (sl5 > baremeNoteSlx[l][1]) {
                                notebetSl5 = baremeNoteSlx[l][0];
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetSl5'),(notebetSl5));
                            }
                            ;
                            if (saal5 > baremeNoteSadx[l][1]) {
                                notebetaal5 = baremeNoteSadx[l][0];
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetaal5'),(notebetaal5));
                            }
                            ;
                            if (tj5 > baremeNoteTjx[l][1]) {
                                notebetTj5 = baremeNoteTjx[l][0];
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetTj5'),(notebetTj5));
                            }
                            ;
                            if (sdsl15 > baremeNoteSadx[l][1]) {
                                notebetdsl15 = baremeNoteSadx[l][0];
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetdsl15'),(notebetdsl15));
                            }
                            ;
                            if (sl15 > baremeNoteSlx[l][1]) {
                                notebetSl15 = baremeNoteSlx[l][0];
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetSl15'),(notebetSl15));
                            }
                            ;
                            if (saal15 > baremeNoteSadx[l][1]) {
                                notebetaal15 = baremeNoteSadx[l][0];
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetaal15'),(notebetaal15));
                            }
                            ;
                            if (tj15 > baremeNoteTjx[l][1]) {
                                notebetTj15 = baremeNoteTjx[l][0];
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetTj15'),(notebetTj15));
                            }
                            ;
                        }
                        ;
                        for (let m = 0; m < 6; m++) {
                            if (age > baremeNoteAge[m][1]) {
                                notebetAge = baremeNoteAge[m][0];
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetAge'),(notebetAge));
                            }
                            ;
                        }
                        ;
                        let noteBetSorare = Math.round((+notebetTj5 + notebetdsl5 + notebetTj15 + notebetdsl15 + notebetaal15 + notebetSl5 + notebetSl15 + notebetAge + notebetaal5) * 2.22);
                        //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/noteBetSorare'),(noteBetSorare));
                        console.log(count, "etape4");
                        let tabSlugCardRare = [];
                        let tabSlugCardLimited = [];
                        let tabSlugCardSuperRare = [];
                        let tabSlugCardUnique = [];
                        let nbArrayRare = 0;
                        let nbArrayLimited = 0;
                        let nbArraySuperRare = 0;
                        let nbArrayUnique = 0;
                        let nbSeason = Object.keys(get_player.cardSupply).length;
                        let nbCardsRare = 0;
                        let nbCardsLimited = 0;
                        let nbCardsSuperRare = 0;
                        let nbCardsUnique = 0;
                        let season = 0;
                        let tabCardsRare = [];
                        let tabCardsSuperRare = [];
                        let tabCardsUnique = [];
                        let tabCardsLimited = [];
                        let tabCardsRareTOTAL = [];
                        let tabCardsSuperRareTOTAL = [];
                        let tabCardsUniqueTOTAL = [];
                        let tabCardsLimitedTOTAL = [];
                        let result = [];
                        let tabPriceRare = [];
                        let tabPriceSuperRare = [];
                        let tabPriceUnique = [];
                        let tabPriceLimited = [];
                        let bestpriceRare = 0;
                        let bestpriceSuperRare = 0;
                        let bestpriceUnique = 0;
                        let bestpriceLimited = 0;
                        let priceLimited = 0;
                        let priceUnique = 0;
                        let priceSuperRare = 0;
                        let priceRare = 0;
                        for (let f = 0; f < nbSeason; f++) {
                            nbCardsRare = get_player.cardSupply[f].rare;
                            nbCardsLimited = get_player.cardSupply[f].limited;
                            nbCardsSuperRare = get_player.cardSupply[f].superRare;
                            nbCardsUnique = get_player.cardSupply[f].unique;
                            season = get_player.cardSupply[f].season.startYear;
                            if (nbCardsRare != 0) {
                                for (let h = 0; h < nbCardsRare; h++) {
                                    tabSlugCardRare.push(playerslug + "-" + season + "-rare-" + (+h + 1));
                                    nbArrayRare = Math.ceil(tabSlugCardRare.length / 100);
                                }
                                ;
                            }
                            if (nbCardsLimited != 0) {
                                for (let h = 0; h < nbCardsLimited; h++) {
                                    tabSlugCardLimited.push(playerslug + "-" + season + "-limited-" + (+h + 1));
                                    nbArrayLimited = Math.ceil(tabSlugCardLimited.length / 100);
                                }
                                ;
                            }
                            if (nbCardsSuperRare != 0) {
                                for (let h = 0; h < nbCardsSuperRare; h++) {
                                    tabSlugCardSuperRare.push(playerslug + "-" + season + "-super_rare-" + (+h + 1));
                                    nbArraySuperRare = Math.ceil(tabSlugCardSuperRare.length / 100);
                                }
                                ;
                            }
                            if (nbCardsUnique != 0) {
                                for (let h = 0; h < nbCardsUnique; h++) {
                                    tabSlugCardUnique.push(playerslug + "-" + season + "-unique-" + (+h + 1));
                                    nbArrayUnique = Math.ceil(tabSlugCardUnique.length / 100);
                                }
                                ;
                            }
                        }
                        ;
                        console.log("etape5");
                        // console.log(nbArrayRare);
                        // ######## RECHERCHE PRIX RARE ########
                        if (nbArrayRare != 0 && nbArrayRare != null && nbArrayRare != undefined) {
                            let slugsRare = [];
                            for (let k = 0; k < nbArrayRare; k++) {
                                slugsRare = tabSlugCardRare.slice(0 + (k * 100), 100 + (k * 100));
                                const variables = { slugs: slugsRare };
                                const cardsRareData = yield graphQLClient.request(GET_PRICE, variables);
                                const getCardsrare = cardsRareData.cards;
                                tabCardsRare.push([getCardsrare.flat(Infinity)]);
                                tabCardsRareTOTAL = tabCardsRare.flat(Infinity);
                                result = tabCardsRareTOTAL.filter(tabCardsRareTOTAL => tabCardsRareTOTAL.onSale === true);
                                if (result != null) {
                                    global.cardsOnSaleRare = result;
                                    for (let i = 0; i < result.length; i++) {
                                        if (result[i].pictureUrl != undefined) {
                                            global.cardpicturerare = result[i].pictureUrl;
                                        }
                                    }
                                }
                                ;
                                for (let n = 0; n < result.length; n++) {
                                    if ((result[n].liveSingleSaleOffer != null)) {
                                        tabPriceRare.push([result[n].liveSingleSaleOffer.price]);
                                    }
                                    bestpriceRare = Math.min(...(tabPriceRare.flat(Infinity))) / Math.pow(10, 18);
                                }
                                if (bestpriceRare === Infinity || bestpriceRare === 0) {
                                    priceRare = 0;
                                    global.onSaleRare = "false";
                                }
                                else {
                                    priceRare = bestpriceRare;
                                    global.onSaleRare = "true";
                                }
                                ;
                            }
                        }
                        else {
                            global.onSaleRare = "false";
                            global.cardpicturerare = "";
                            global.cardsOnSaleRare = [];
                        }
                        // ######## RECHERCHE PRIX LIMITED ########
                        if (nbArrayLimited != 0 && nbArrayLimited != null && nbArrayLimited != undefined) {
                            let slugsLimited = [];
                            for (let k = 0; k < nbArrayLimited; k++) {
                                slugsLimited = tabSlugCardLimited.slice(0 + (k * 100), 100 + (k * 100));
                                const variables = { slugs: slugsLimited };
                                const cardsLimitedData = yield graphQLClient.request(GET_PRICE, variables);
                                const getCardsLimited = cardsLimitedData.cards;
                                tabCardsLimited.push([getCardsLimited.flat(Infinity)]);
                                tabCardsLimitedTOTAL = tabCardsLimited.flat(Infinity);
                                result = tabCardsLimitedTOTAL.filter(tabCardsLimitedTOTAL => tabCardsLimitedTOTAL.onSale === true);
                                if (result != null) {
                                    //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardsOnSaleLimited'),(result));
                                    global.cardsOnSaleLimited = result;
                                    // //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardpicturelimited'),(result[0].pictureUrl));
                                    for (let i = 0; i < result.length; i++) {
                                        if (result[i].pictureUrl != undefined) {
                                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardpicturelimited'),(result[i].pictureUrl));
                                            global.cardpicturelimited = result[i].pictureUrl;
                                        }
                                    }
                                }
                                ;
                                console.log(count, "etape6");
                                for (let n = 0; n < result.length; n++) {
                                    if ((result[n].liveSingleSaleOffer != null)) {
                                        tabPriceLimited.push([result[n].liveSingleSaleOffer.price]);
                                    }
                                    bestpriceLimited = Math.min(...(tabPriceLimited.flat(Infinity))) / Math.pow(10, 18);
                                }
                                if (bestpriceLimited === Infinity || bestpriceLimited === 0) {
                                    priceLimited = 0;
                                    global.onSaleLimited = "false";
                                }
                                else {
                                    priceLimited = bestpriceLimited;
                                    global.onSaleLimited = "true";
                                }
                                ;
                            }
                            ;
                        }
                        else {
                            global.onSaleLimited = "false";
                            global.cardpicturelimited = "";
                            global.cardsOnSaleLimited = [];
                        }
                        console.log(count, "etape6");
                        // ######## RECHERCHE PRIX SUPER RARE ########
                        if (nbArraySuperRare != 0 && nbArraySuperRare != null && nbArraySuperRare != undefined) {
                            let slugsSuperRare = [];
                            for (let k = 0; k < nbArraySuperRare; k++) {
                                slugsSuperRare = tabSlugCardSuperRare.slice(0 + (k * 100), 100 + (k * 100));
                                const variables = { slugs: slugsSuperRare };
                                const cardsSuperRareData = yield graphQLClient.request(GET_PRICE, variables);
                                const getCardsSuperRare = cardsSuperRareData.cards;
                                tabCardsSuperRare.push([getCardsSuperRare.flat(Infinity)]);
                                tabCardsSuperRareTOTAL = tabCardsSuperRare.flat(Infinity);
                                result = tabCardsSuperRareTOTAL.filter(tabCardsSuperRareTOTAL => tabCardsSuperRareTOTAL.onSale === true);
                                if (result != null) {
                                    //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardsOnSaleSuperRare'),(result));
                                    global.cardsOnSaleSuperRare = result;
                                    // //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardpictureSuperRare'),(result[0].pictureUrl));
                                    for (let i = 0; i < result.length; i++) {
                                        if (result[i].pictureUrl != undefined) {
                                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardpictureSuperRare'),(result[i].pictureUrl));
                                            global.cardpictureSuperRare = result[i].pictureUrl;
                                        }
                                    }
                                }
                                for (let n = 0; n < result.length; n++) {
                                    if ((result[n].liveSingleSaleOffer != null)) {
                                        tabPriceSuperRare.push([result[n].liveSingleSaleOffer.price]);
                                    }
                                    bestpriceSuperRare = Math.min(...(tabPriceSuperRare.flat(Infinity))) / Math.pow(10, 18);
                                }
                                console.log(bestpriceSuperRare);
                                if (bestpriceSuperRare === Infinity || bestpriceSuperRare === 0) {
                                    priceSuperRare = 0;
                                    global.onSaleSuperRare = "false";
                                }
                                else {
                                    priceSuperRare = bestpriceSuperRare;
                                    global.onSaleSuperRare = "true";
                                }
                                ;
                            }
                            ;
                        }
                        else {
                            global.onSaleSuperRare = "false";
                            global.cardpictureSuperRare = "";
                            global.cardsOnSaleSuperRare = [];
                        }
                        console.log(count, "etape7");
                        // ######## RECHERCHE PRIX UNIQUE ########
                        if (nbArrayUnique != 0 && nbArrayUnique != null && nbArrayUnique != undefined) {
                            let slugsUnique = [];
                            for (let k = 0; k < nbArrayUnique; k++) {
                                slugsUnique = tabSlugCardUnique.slice(0 + (k * 100), 100 + (k * 100));
                                const variables = { slugs: slugsUnique };
                                const cardsUniqueData = yield graphQLClient.request(GET_PRICE, variables);
                                const getCardsUnique = cardsUniqueData.cards;
                                tabCardsUnique.push([getCardsUnique.flat(Infinity)]);
                                tabCardsUniqueTOTAL = tabCardsUnique.flat(Infinity);
                                result = tabCardsUniqueTOTAL.filter(tabCardsUniqueTOTAL => tabCardsUniqueTOTAL.onSale === true);
                                if (result != null) {
                                    //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardsOnSaleUnique'),(result));
                                    global.cardsOnSaleUnique = result;
                                    // //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardpictureUnique'),(result[0].pictureUrl));
                                    for (let i = 0; i < result.length; i++) {
                                        if (result[i].pictureUrl != undefined) {
                                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardpictureUnique'),(result[i].pictureUrl));
                                            global.cardpictureUnique = result[i].pictureUrl;
                                        }
                                    }
                                }
                                for (let n = 0; n < result.length; n++) {
                                    if ((result[n].liveSingleSaleOffer != null)) {
                                        tabPriceUnique.push([result[n].liveSingleSaleOffer.price]);
                                    }
                                    bestpriceUnique = Math.min(...(tabPriceUnique.flat(Infinity))) / Math.pow(10, 18);
                                }
                                if (bestpriceUnique === Infinity || bestpriceUnique === 0) {
                                    priceUnique = 0;
                                    global.onSaleUnique = "false";
                                }
                                else {
                                    priceUnique = bestpriceUnique;
                                    global.onSaleUnique = "true";
                                }
                                ;
                            }
                            ;
                        }
                        else {
                            global.onSaleUnique = "false";
                            global.cardpictureUnique = "";
                            global.cardsOnSaleUnique = [];
                        }
                        console.log(count, "etape8");
                        variables = { slug: playerslug, };
                        const liste_resultats = yield graphQLClient.request(GET_RESULTATS, variables);
                        if (position === "Goalkeeper") {
                            const getCardsPictureCommon = yield graphQLClient.request(GET_CARD_COMMON, variables);
                            if (getCardsPictureCommon.player.cardSampleUrl !== null) {
                                global.cardpicturecommon = getCardsPictureCommon.player.cardSampleUrl;
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+  '/cardpicturecommon'),(global.cardpicturecommon))
                                ;
                            }
                            else {
                                global.cardpicturecommon = "";
                            }
                        }
                        else {
                            global.cardpicturecommon = "false";
                        }
                        ;
                        global.minsPlayed = [];
                        global.score = [];
                        for (let i = 0; i < 15; i++) {
                            if (liste_resultats.player.gameStats && liste_resultats.player.gameStats[i] && liste_resultats.player.gameStats[i].minsPlayed !== null) {
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+  '/minsPlayed/'+i),(liste_resultats.player.gameStats[i].minsPlayed));
                                global.minsPlayed.push(liste_resultats.player.gameStats[i].minsPlayed);
                            }
                            else {
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+  '/minsPlayed/'+i),(0));
                                global.minsPlayed.push(0);
                            }
                            if (liste_resultats.player.allSo5Scores && liste_resultats.player.allSo5Scores.nodes[i] && liste_resultats.player.allSo5Scores.nodes[i].score !== null) {
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+  '/score/'+i),(liste_resultats.player.allSo5Scores.nodes[i].score)); 
                                global.score.push(liste_resultats.player.allSo5Scores.nodes[i].score);
                            }
                            else {
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+  '/score/'+i),(0)); 
                                global.score.push(0);
                            }
                        }
                        ;
                        console.log(count, "etape9");
                        if (priceLimited != null && sl5 != null && priceLimited != 0) {
                            global.ratioLimited = Math.round(sl5 / priceLimited);
                        }
                        else {
                            global.ratioLimited = 0;
                        }
                        ;
                        if (priceRare != null && sl5 != null && priceRare != 0) {
                            global.ratioRare = Math.round(sl5 / priceRare);
                        }
                        else {
                            global.ratioRare = 0;
                        }
                        if (priceSuperRare != null && sl5 != null && priceSuperRare != 0) {
                            global.ratioSuperRare = Math.round(sl5 / priceSuperRare);
                        }
                        else {
                            global.ratioSuperRare = 0;
                        }
                        if (priceUnique != null && sl5 != null && priceUnique != 0) {
                            global.ratioUnique = Math.round(sl5 / priceUnique);
                        }
                        else {
                            global.ratioUnique = 0;
                        }
                        console.log(count, "etape10");
                        console.log(count, playerslug, "limited: " + priceLimited, "rare: " + priceRare, "superRare: " + priceSuperRare, "unique: " + priceUnique);
                        console.log(count, playerslug, "limited: " + global.onSaleLimited, "rare: " + global.onSaleRare, "superRare: " + global.onSaleSuperRare, "unique: " + global.onSaleUnique);
                        const priceRef = (0, firestore_1.collection)(db, "price", playerslug, Date());
                        yield (0, firestore_2.setDoc)((0, firestore_2.doc)(priceRef), {
                            priceLimited: priceLimited,
                            priceSuperRare: priceSuperRare,
                            priceUnique: priceUnique,
                            priceRare: priceRare,
                            Maj: Date()
                        });
                        const playerRef = (0, firestore_1.collection)(db, "players", global.competition, position);
                        yield (0, firestore_2.setDoc)((0, firestore_2.doc)(playerRef, playerslug), {
                            Maj: Date(),
                            age: age,
                            cardpicturelimited: global.cardpicturelimited,
                            cardpicturerare: global.cardpicturerare,
                            cardpicturecommon: global.cardpicturecommon,
                            cardsOnSaleLimited: global.cardsOnSaleLimited,
                            cardsOnSaleRare: global.cardsOnSaleRare,
                            competition: global.competition,
                            leagueslug: global.leagueslug,
                            minsPlayed: global.minsPlayed,
                            nationalteamPicture: global.nationalteamPicture,
                            nationalteamname: global.nationalteamname,
                            noteBetSorare: noteBetSorare,
                            notebetAge: notebetAge,
                            notebetSl15: notebetSl15,
                            notebetSl5: notebetSl5,
                            notebetTj5: notebetTj5,
                            notebetaal5: notebetaal5,
                            notebetaal15: notebetaal15,
                            notebetdsl15: notebetdsl15,
                            onSaleLimited: global.onSaleLimited,
                            onSaleRare: global.onSaleRare,
                            onSaleUnique: global.onSaleUnique,
                            onSaleSuperRare: global.onSaleSuperRare,
                            playername: playername,
                            playerpictureURL: global.playerpictureURL,
                            playerslug: playerslug,
                            position: position,
                            priceLimited: priceLimited,
                            priceSuperRare: priceSuperRare,
                            priceUnique: priceUnique,
                            priceRare: priceRare,
                            saal15: saal15,
                            saal5: saal5,
                            score: global.score,
                            sdsl15: sdsl15,
                            sdsl5: sdsl5,
                            sl5: sl5,
                            sl15: sl15,
                            status: global.statut,
                            teamleague: global.teamleague,
                            teamname: global.teamname,
                            teampictureURL: global.teampictureURL,
                            teamslug: global.teamslug,
                            tj5: tj5,
                            tj15: tj15,
                            ratioRare: global.ratioRare,
                            ratioLimited: global.ratioLimited,
                            ratioSuperRare: global.ratioSuperRare,
                            ratioUnique: global.ratioUnique,
                            // allSo5Scores:global.allSo5Scores
                        });
                        console.log("joueur n??: " + (count) + " " + playername + " import??!");
                    }
                    else {
                        console.log("joueur n??: " + (count + 1) + " " + playername + " non import??!");
                    }
                }
                catch (error) {
                    while (+count < (+nbPlayersLicense - 1))
                        ;
                }
            } while (+count < (+nbPlayersLicense - 1));
        });
    }
    console.log("Tous les joueurs ont ??t?? import??!" + Date());
    main().catch((error) => console.error(error));
});
// ########################  REQUETES  ##############################
// ################################################################
// #########################  PROFIL  ######################
router.get('/api/profil', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const GET_PROFIL_CURRENT_USER = (0, graphql_request_1.gql) `
  query current_user{
    currentUser{
      totalBalance
      nickname
      createdAt
      allTimeBestDecksInFormation{
        pictureUrl
      }
      profile{
        clubName
        pictureUrl
        proSince
        slug
        discordUsername
        clubBanner{
          pictureUrl
        }
      }
    }
  }
  `;
        const GET_WALLET_CURRENT_USER = (0, graphql_request_1.gql) `
  query current_user{
    currentUser{
      totalBalance
      cardCounts{
        limited
        rare
        superRare
        unique
      }
      directOffers(direction:SENT){
        totalCount
        nodes{
          aasmState
          id
          creditCardFee
          acceptedAt
          sendWeiAmount
          sendCardOffers{
            id
            card{
              rarity
              age
              slug
              name
              pictureUrl
              player{
                displayName
                slug
                position
                age
                activeClub{
                  pictureUrl
                  slug
                  name
                    domesticLeague{
                    slug
                  }
                }
              }
            }
          }
        }
      }
      wonEnglishAuctions(sortByEndDate:DESC){
        totalCount
        nodes{
          id
          name
          currentPrice
          creditCardFee
          endDate
          cards{
            rarity
            pictureUrl
            slug
            player{
              displayName
              slug
              position
              age
              activeClub{
                pictureUrl
                slug
                name
                domesticLeague{
                  slug
                }
              }
            }
          }
        }
       }    
      paginatedCards(first:300){
        nodes{
          rarity
          player{
            position
            slug
            displayName
            age
            activeClub{
              pictureUrl
              name
              slug
              domesticLeague{
                slug
              }
            }
          }
          grade
          onSale
          ownerSince
          xp
          owner{
            from
            price
            transferType
          }
          name
          slug
          pictureUrl
        }
      }
    }
  }
  `;
        const GET_DIRECT_OFFER_RECEIVE_CURRENT_USER = (0, graphql_request_1.gql) `
  query direct_offer{
    currentUser{
      directOffers(direction:RECEIVED){
        totalCount
        nodes{
          aasmState
          id
          creditCardFee
          acceptedAt
          sendWeiAmount
          receiveWeiAmount
          sendCardOffers{
              id
            card{
              rarity
              age
              slug
              name
              pictureUrl
              player{
                displayName
                slug
                position
                age
                activeClub{
                  pictureUrl
                  slug
                  name
                    domesticLeague{
                    slug
                  }
                }
              }
            }
          }
          receiveCardOffers{
            id
            card{
              rarity
              age
              slug
              name
              pictureUrl
              player{
                displayName
                slug
                position
                age
                activeClub{
                  pictureUrl
                  slug
                  name
                    domesticLeague{
                    slug
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  `;
        const GET_DIRECT_OFFER_SENT_CURRENT_USER = (0, graphql_request_1.gql) `
  query direct_offer{
    currentUser{
      directOffers(direction:SENT){
        totalCount
        nodes{
          aasmState
          id
          creditCardFee
          acceptedAt
          sendWeiAmount
          receiveWeiAmount
          sendCardOffers{
              id
            card{
              rarity
              age
              slug
              name
              pictureUrl
              player{
                displayName
                slug
                position
                age
                activeClub{
                  pictureUrl
                  slug
                  name
                    domesticLeague{
                    slug
                  }
                }
              }
            }
          }
          receiveCardOffers{
            id
            card{
              rarity
              age
              slug
              name
              pictureUrl
              player{
                displayName
                slug
                position
                age
                activeClub{
                  pictureUrl
                  slug
                  name
                    domesticLeague{
                    slug
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  `;
        const code = req.query.code;
        global.user = req.query.user;
        console.log(global.user);
        console.log(code);
        const headers = { 'content-type': 'application/x-www-form-urlencoded' };
        axios_1.default.post('https://api.sorare.com/oauth/token', 'client_id=Jx38v06GOdnDTFVriMGYuh5A0DN26eCYP0txLu614AI&client_secret=z7d_cdmmj2zJsUY-Ko-q2gjJ58zewWnJYH-X9P_e2qg&code=' + code + '&grant_type=authorization_code&redirect_uri=https://betsorare.web.app/auth/sorare/callback', { headers: headers })
            .then(function (response) {
            return __awaiter(this, void 0, void 0, function* () {
                res = response.data.access_token;
                global.user_token = response.data.access_token;
                const endpoint = 'https://api.sorare.com/graphql';
                const graphQLClient = new graphql_request_1.GraphQLClient(endpoint, {
                    headers: {
                        Authorization: 'Bearer ' + global.user_token + '',
                        'content-type': 'application/json'
                    },
                });
                const profil = yield graphQLClient.request(GET_PROFIL_CURRENT_USER);
                const myProfil = profil.currentUser;
                console.log("date: ", myProfil.createdAt);
                console.log(response.data.access_token);
                console.log(myProfil);
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/token'), (global.user_token));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/nickname'), (myProfil.nickname));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/totalBalance'), (myProfil.totalBalance / Math.pow(10, 18)));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/createdAt'), (myProfil.createdAt));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/clubName'), (myProfil.profile.clubName));
                (0, database_1.onValue)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/'), (snapshot) => {
                    const profil = snapshot.val();
                    if (profil.points != undefined) {
                        const points = profil.points;
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/points'), (points));
                    }
                    else {
                        const points = 300;
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/points'), (points));
                    }
                    if (profil.status === undefined) {
                        const status = "coach";
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/status'), (status));
                    }
                }, { onlyOnce: true });
                if (myProfil.profile.pictureUrl === "") {
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/pictureUrl'), ("https://firebasestorage.googleapis.com/v0/b/betsorare.appspot.com/o/avatar-unknow.png?alt=media&token=8b97f8a9-3c6b-4c46-b0f7-e9b31317d83b"));
                }
                else {
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/pictureUrl'), (myProfil.profile.pictureUrl));
                }
                if (myProfil.allTimeBestDecksInFormation[0] != null) {
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/BestDeck'), (myProfil.allTimeBestDecksInFormation[0]));
                }
                const users = (0, firestore_1.collection)(db, "users");
                yield (0, firestore_2.setDoc)((0, firestore_2.doc)(users, global.user), {
                    Maj: Date(),
                    user: global.user,
                    token: global.user_token,
                });
                const dbRef = (0, database_1.ref)((0, database_1.getDatabase)());
                const userWallet = yield graphQLClient.request(GET_WALLET_CURRENT_USER);
                const myCards = userWallet.currentUser.paginatedCards.nodes;
                const nbRarityCards = userWallet.currentUser.cardCounts;
                const nbCards = myCards.length;
                const userAuctions = userWallet.currentUser.wonEnglishAuctions.nodes;
                const nbAuctions = userAuctions.length;
                var allMyCards = [];
                var tabAllAuctions = [0];
                var tabBalanceSent = [0];
                var tabBalanceReceived = [0];
                var tabAllValue = [0];
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/'), (""));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction'), (""));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers'), (""));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/nombreCards'), (nbRarityCards));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/watching/totalWallet'), (userWallet.currentUser.totalBalance / Math.pow(10, 18)));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/lastRefresh'), (Date()));
                const reducer = (previousValue, currentValue) => previousValue + currentValue;
                // #####################################
                // paginatedCards(first:300)############
                (0, database_1.get)((0, database_1.child)(dbRef, global.user + '/mycards/lockedprice')).then((snapshot) => {
                    if (snapshot.exists()) {
                        const myCardsLock = snapshot.val();
                        global.cardsLockArray = [];
                        for (let i = 0; i < myCardsLock.length; i++) {
                            global.cardsLockArray.push(myCardsLock[i].cardSlug, myCardsLock[i].priceLocked);
                        }
                    }
                    else {
                    }
                }).catch((error) => {
                    console.error(error);
                });
                for (let i = 0; i < nbCards; i++) {
                    if (myCards[i].rarity != "common") {
                        allMyCards.push(myCards[i]);
                    }
                }
                const nbCardqRarity = allMyCards.length;
                for (let i = 0; i < nbCardqRarity; i++) {
                    const playername = allMyCards[i].player.displayName;
                    const age = allMyCards[i].player.age;
                    const position = allMyCards[i].player.position;
                    const dateAchat = allMyCards[i].ownerSince;
                    const playerslug = allMyCards[i].player.slug;
                    const Url = allMyCards[i].pictureUrl;
                    const rarity = allMyCards[i].rarity;
                    global.cardslug = allMyCards[i].slug;
                    const getOnSale = allMyCards[i].onSale;
                    const grade = allMyCards[i].grade;
                    const xp = allMyCards[i].xp;
                    const transferType = allMyCards[i].owner.transferType;
                    global.priceAchat = (allMyCards[i].owner.price) / Math.pow(10, 18);
                    global.lock = "lock_open";
                    if (allMyCards[i].player.activeClub.domesticLeague.slug != null) {
                        global.leagueslug = allMyCards[i].player.activeClub.domesticLeague.slug;
                    }
                    else {
                        global.leagueslug = "other";
                    }
                    ;
                    if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                        global.competition = "champion-europe";
                    }
                    else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leagueslug === "ukrainian-premier-league") {
                        global.competition = "challenger-europe";
                    }
                    else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                        global.competition = "champion-asia";
                    }
                    else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                        global.competition = "champion-america";
                    }
                    else {
                        global.competition = "other";
                    }
                    ;
                    if (allMyCards[i].player.activeClub.pictureUrl != null) {
                        global.team = allMyCards[i].player.activeClub.name;
                        global.teamUrl = allMyCards[i].player.activeClub.pictureUrl;
                    }
                    else {
                        global.teamUrl = "";
                        global.team = "";
                    }
                    const docRef = (0, firestore_2.doc)((0, firestore_1.getFirestore)(), "players", global.competition, position, playerslug);
                    const docSnap = yield (0, firestore_1.getDoc)(docRef);
                    if (docSnap.exists()) {
                        global.noteSorareManger = docSnap.data().noteBetSorare;
                        const sl5 = docSnap.data().sl5;
                        const sl15 = docSnap.data().sl15;
                        const tj5 = docSnap.data().tj5;
                        const tj15 = docSnap.data().tj15;
                        if (sl5 > sl15) {
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/performances'), ("increase"));
                        }
                        else {
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/performances'), ("discrease"));
                        }
                        if (tj5 > tj15) {
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/tempsJeu'), ("increase"));
                        }
                        else {
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/tempsJeu'), ("discrease"));
                        }
                        if (rarity === "limited") {
                            global.lastValue = docSnap.data().priceLimited, global.onSale = docSnap.data().onSaleLimited;
                        }
                        else if (rarity === "rare") {
                            global.lastValue = docSnap.data().priceRare, global.onSale = docSnap.data().onSaleRare;
                        }
                    }
                    else {
                        // doc.data() will be undefined in this case
                        global.lastValue = 0;
                    }
                    ;
                    tabAllValue.push(global.lastValue);
                    if (global.cardsLockArray != undefined && global.cardsLockArray.includes(global.cardslug)) {
                        global.cardsLockArray.indexOf(global.cardslug);
                        const findIndex = global.cardsLockArray.indexOf(global.cardslug) + 1;
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/locked'), ("lock"));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/priceAchat'), (global.cardsLockArray[findIndex]));
                    }
                    else {
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/locked'), (global.lock));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/priceAchat'), (global.priceAchat));
                    }
                    ;
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/playername'), (playername));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/age'), (age));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/position'), (position));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/dateAchat'), (dateAchat));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/Url'), (Url));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/rarete'), (rarity));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/cardslug'), (global.cardslug));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/onSale'), (getOnSale));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/grade'), (grade));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/xp'), (xp));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/playerslug'), (playerslug));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/transferType'), (transferType));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/league'), (global.leagueslug));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/competition'), (global.competition));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/lastValue'), (global.lastValue));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/onSale'), (global.onSale));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/rentapotent'), (global.lastValue - global.priceAchat));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/teamUrl'), (global.teamUrl));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/team'), (global.team));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/noteSorareManger'), (global.noteSorareManger));
                    if (global.priceAchat != 0) {
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/rentapotentPercent'), (((global.lastValue - global.priceAchat)) / global.priceAchat) * 100);
                    }
                    else {
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mycards/card/' + i + '/rentapotentPercent'), (100));
                    }
                }
                const allValue = tabAllValue.reduce(reducer).toFixed(3);
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/watching/totalValueWallet'), (+allValue));
                // ##############################
                // wonEnglishAuctions############
                for (let i = 0; i < nbAuctions; i++) {
                    const auctionsCard = userAuctions[i].cards[0];
                    const nbCardsAuction = userAuctions[i].cards.length;
                    const cardName = userAuctions[i].name;
                    const currentPrice = userAuctions[i].currentPrice / Math.pow(10, 18);
                    tabAllAuctions.push(userAuctions[i].currentPrice / Math.pow(10, 18));
                    const creditCardFee = userAuctions[i].creditCardFee;
                    const endDate = userAuctions[i].endDate;
                    const id = userAuctions[i].id;
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction/' + i + '/cardName'), (cardName));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction/' + i + '/currentPrice'), (currentPrice));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction/' + i + '/endDate'), (endDate));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction/' + i + '/id'), (id));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction/' + i + '/creditCardFee'), (creditCardFee));
                    for (let g = 0; g < nbCardsAuction; g++) {
                        const cardSlug = userAuctions[i].cards[g].slug;
                        const rarete = userAuctions[i].cards[g].rarity;
                        const cardPicture = userAuctions[i].cards[g].pictureUrl;
                        const playerSlug = userAuctions[i].cards[g].player.slug;
                        const playerName = userAuctions[i].cards[g].player.displayName;
                        const position = userAuctions[i].cards[g].player.position;
                        const age = userAuctions[i].cards[g].player.age;
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/cardSlug'), (cardSlug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/cardPicture'), (cardPicture));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/playerSlug'), (playerSlug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/playerName'), (playerName));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/position'), (position));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/rarete'), (rarete));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/age'), (age));
                    }
                    const cardSlug = auctionsCard.slug;
                    const rarete = auctionsCard.rarity;
                    const cardPicture = auctionsCard.pictureUrl;
                    const playerSlug = auctionsCard.player.slug;
                    const playerName = auctionsCard.player.displayName;
                    const position = auctionsCard.player.position;
                    const age = auctionsCard.player.age;
                    if (auctionsCard.player.activeClub != null) {
                        global.teamSlug = auctionsCard.player.activeClub.slug;
                        global.team = auctionsCard.player.activeClub.name;
                    }
                    else {
                        global.teamSlug = "";
                        global.team = "";
                    }
                    if (auctionsCard.player.activeClub.pictureUrl != null) {
                        global.teamUrl = auctionsCard.player.activeClub.pictureUrl;
                    }
                    else {
                        global.teamUrl = "";
                    }
                    if (auctionsCard.player.activeClub.domesticLeague.slug != null) {
                        global.leagueslug = allMyCards[i].player.activeClub.domesticLeague.slug;
                    }
                    else {
                        global.league = "other";
                    }
                    ;
                    if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                        global.competition = "champion-europe";
                    }
                    else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                        global.competition = "challenger-europe";
                    }
                    else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                        global.competition = "champion-asia";
                    }
                    else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                        global.competition = "champion-america";
                    }
                    else {
                        global.competition = "other";
                    }
                    ;
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction/' + i + '/teamSlug'), (global.teamSlug));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction/' + i + '/team'), (global.team));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction/' + i + '/teamUrl'), (global.teamUrl));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction/' + i + '/leagueslug'), (global.leagueslug));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/myauctions/auction/' + i + '/competition'), (global.competition));
                }
                const allAuctions = tabAllAuctions.reduce(reducer).toFixed(3);
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/watching/totalAuctions'), (+allAuctions));
                // ########################################
                // directOffers(direction:SENT)############
                const userOfferWallet = yield graphQLClient.request(GET_DIRECT_OFFER_RECEIVE_CURRENT_USER);
                const userOfferReceived = userOfferWallet.currentUser.directOffers.nodes;
                const nbOfferSReceived = userOfferReceived.length;
                let f = -1;
                for (let i = 0; i < nbOfferSReceived; i++) {
                    const aasmState = userOfferReceived[i].aasmState;
                    if (aasmState === "accepted") {
                        f++;
                        const id = userOfferReceived[i].id;
                        const creditCardFee = userOfferReceived[i].creditCardFee;
                        const acceptedAt = userOfferReceived[i].acceptedAt;
                        const sendWeiAmount = userOfferReceived[i].sendWeiAmount;
                        const receiveWeiAmount = userOfferReceived[i].receiveWeiAmount;
                        const nbOffertReceiveCards = userOfferReceived[i].receiveCardOffers.length;
                        const nbOffertSentCards = userOfferReceived[i].sendCardOffers.length;
                        tabBalanceSent.push((sendWeiAmount - receiveWeiAmount) / Math.pow(10, 18));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/transfert'), ("sent"));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/id'), (id));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/creditCardFee'), (creditCardFee));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/acceptedAt'), (acceptedAt));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/receiveWeiAmount'), (sendWeiAmount / Math.pow(10, 18)));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/sendWeiAmount'), (receiveWeiAmount / Math.pow(10, 18)));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/balance'), ((sendWeiAmount - receiveWeiAmount) / Math.pow(10, 18)));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/nbOffertCards'), (nbOffertSentCards));
                        if (userOfferReceived[i].receiveCardOffers != null) {
                            for (let g = 0; g < nbOffertReceiveCards; g++) {
                                const id = userOfferReceived[i].receiveCardOffers[g].id;
                                const rarete = userOfferReceived[i].receiveCardOffers[g].card.rarity;
                                const age = userOfferReceived[i].receiveCardOffers[g].card.age;
                                const cardSlug = userOfferReceived[i].receiveCardOffers[g].card.slug;
                                const position = userOfferReceived[i].receiveCardOffers[g].card.player.position;
                                const cardName = userOfferReceived[i].receiveCardOffers[g].card.name;
                                const cardPicture = userOfferReceived[i].receiveCardOffers[g].card.pictureUrl;
                                const displayName = userOfferReceived[i].receiveCardOffers[g].card.player.displayName;
                                const playerSlug = userOfferReceived[i].receiveCardOffers[g].card.player.slug;
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/id'), (id));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/id'), (id));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/rarete'), (rarete));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/age'), (age));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/cardSlug'), (cardSlug));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/cardName'), (cardName));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/cardPicture'), (cardPicture));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/displayName'), (displayName));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/playerSlug'), (playerSlug));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/position'), (position));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/transfert'), ("received"));
                                if (userOfferReceived[i].receiveCardOffers[g].card.player.activeClub != null) {
                                    global.teamSlug = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.slug;
                                    global.team = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.name;
                                }
                                else {
                                    global.teamSlug = "";
                                    global.team = "";
                                }
                                if (userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.pictureUrl != null) {
                                    global.teamUrl = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.pictureUrl;
                                }
                                else {
                                    global.teamUrl = "";
                                }
                                if (userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.domesticLeague.slug != null) {
                                    global.leagueslug = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.domesticLeague.slug;
                                }
                                else {
                                    global.league = "other";
                                }
                                ;
                                if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                                    global.competition = "champion-europe";
                                }
                                else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                                    global.competition = "challenger-europe";
                                }
                                else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                                    global.competition = "champion-asia";
                                }
                                else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                                    global.competition = "champion-america";
                                }
                                else {
                                    global.competition = "other";
                                }
                                ;
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/teamSlug'), (global.teamSlug));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/team'), (global.team));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/teamUrl'), (global.teamUrl));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/leagueslug'), (global.leagueslug));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/competition'), (global.competition));
                            }
                        }
                        if (userOfferReceived[i].sendCardOffers != null) {
                            for (let g = 0; g < nbOffertSentCards; g++) {
                                const id = userOfferReceived[i].sendCardOffers[g].id;
                                const rarete = userOfferReceived[i].sendCardOffers[g].card.rarity;
                                const age = userOfferReceived[i].sendCardOffers[g].card.age;
                                const cardSlug = userOfferReceived[i].sendCardOffers[g].card.slug;
                                const position = userOfferReceived[i].sendCardOffers[g].card.player.position;
                                const cardName = userOfferReceived[i].sendCardOffers[g].card.name;
                                const cardPicture = userOfferReceived[i].sendCardOffers[g].card.pictureUrl;
                                const displayName = userOfferReceived[i].sendCardOffers[g].card.player.displayName;
                                const playerSlug = userOfferReceived[i].sendCardOffers[g].card.player.slug;
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/id'), (id));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/id'), (id));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/rarete'), (rarete));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/age'), (age));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/cardSlug'), (cardSlug));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/cardName'), (cardName));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/cardPicture'), (cardPicture));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/displayName'), (displayName));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/playerSlug'), (playerSlug));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/position'), (position));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/transfert'), ("sent"));
                                if (userOfferReceived[i].sendCardOffers[g].card.player.activeClub != null) {
                                    global.teamSlug = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.slug;
                                    global.team = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.name;
                                }
                                else {
                                    global.teamSlug = "";
                                    global.team = "";
                                }
                                if (userOfferReceived[i].sendCardOffers[g].card.player.activeClub.pictureUrl != null) {
                                    global.teamUrl = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.pictureUrl;
                                }
                                else {
                                    global.teamUrl = "";
                                }
                                if (userOfferReceived[i].sendCardOffers[g].card.player.activeClub.domesticLeague.slug != null) {
                                    global.leagueslug = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.domesticLeague.slug;
                                }
                                else {
                                    global.league = "other";
                                }
                                ;
                                if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                                    global.competition = "champion-europe";
                                }
                                else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                                    global.competition = "challenger-europe";
                                }
                                else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                                    global.competition = "champion-asia";
                                }
                                else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                                    global.competition = "champion-america";
                                }
                                else {
                                    global.competition = "other";
                                }
                                ;
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/teamSlug'), (global.teamSlug));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/team'), (global.team));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/teamUrl'), (global.teamUrl));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/leagueslug'), (global.leagueslug));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/competition'), (global.competition));
                            }
                        }
                    }
                }
                const allBalanceSent = tabBalanceSent.reduce(reducer).toFixed(3);
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/watching/balanceSent'), (+allBalanceSent));
                // ########################################
                // directOffers(direction:RECEIVED)############
                const userOfferSentWallet = yield graphQLClient.request(GET_DIRECT_OFFER_SENT_CURRENT_USER);
                const userOfferSent = userOfferSentWallet.currentUser.directOffers.nodes;
                const nbOfferSent = userOfferSent.length;
                let h = -1;
                for (let i = 0; i < nbOfferSent; i++) {
                    const aasmState = userOfferSent[i].aasmState;
                    if (aasmState === "accepted") {
                        h++;
                        const id = userOfferSent[i].id;
                        const creditCardFee = userOfferSent[i].creditCardFee;
                        const acceptedAt = userOfferSent[i].acceptedAt;
                        const sendWeiAmount = userOfferSent[i].sendWeiAmount;
                        const receiveWeiAmount = userOfferSent[i].receiveWeiAmount;
                        const nbOffertReceiveCards = userOfferSent[i].receiveCardOffers.length;
                        const nbOffertSentCards = userOfferSent[i].sendCardOffers.length;
                        tabBalanceReceived.push((receiveWeiAmount - sendWeiAmount) / Math.pow(10, 18));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/transfert'), ("received"));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/id'), (id));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/creditCardFee'), (creditCardFee));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/acceptedAt'), (acceptedAt));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/sendWeiAmount'), (sendWeiAmount / Math.pow(10, 18)));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/receiveWeiAmount'), (receiveWeiAmount / Math.pow(10, 18)));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/balance'), ((receiveWeiAmount - sendWeiAmount) / Math.pow(10, 18)));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/nbOffertCards'), (nbOffertSentCards));
                        if (userOfferSent[i].receiveCardOffers != null) {
                            for (let g = 0; g < nbOffertReceiveCards; g++) {
                                const id = userOfferSent[i].receiveCardOffers[g].id;
                                const rarete = userOfferSent[i].receiveCardOffers[g].card.rarity;
                                const age = userOfferSent[i].receiveCardOffers[g].card.age;
                                const cardSlug = userOfferSent[i].receiveCardOffers[g].card.slug;
                                const position = userOfferSent[i].receiveCardOffers[g].card.player.position;
                                const cardName = userOfferSent[i].receiveCardOffers[g].card.name;
                                const cardPicture = userOfferSent[i].receiveCardOffers[g].card.pictureUrl;
                                const displayName = userOfferSent[i].receiveCardOffers[g].card.player.displayName;
                                const playerSlug = userOfferSent[i].receiveCardOffers[g].card.player.slug;
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/id'), (id));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/id'), (id));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/rarete'), (rarete));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/age'), (age));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/cardSlug'), (cardSlug));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/cardName'), (cardName));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/cardPicture'), (cardPicture));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/displayName'), (displayName));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/playerSlug'), (playerSlug));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/position'), (position));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/transfert'), ("received"));
                                if (userOfferSent[i].receiveCardOffers[g].card.player.activeClub != null) {
                                    global.teamSlug = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.slug;
                                    global.team = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.name;
                                }
                                else {
                                    global.teamSlug = "";
                                    global.team = "";
                                }
                                if (userOfferSent[i].receiveCardOffers[g].card.player.activeClub.pictureUrl != null) {
                                    global.teamUrl = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.pictureUrl;
                                }
                                else {
                                    global.teamUrl = "";
                                }
                                if (userOfferSent[i].receiveCardOffers[g].card.player.activeClub.domesticLeague.slug != null) {
                                    global.leagueslug = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.domesticLeague.slug;
                                }
                                else {
                                    global.league = "other";
                                }
                                ;
                                if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                                    global.competition = "champion-europe";
                                }
                                else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                                    global.competition = "challenger-europe";
                                }
                                else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                                    global.competition = "champion-asia";
                                }
                                else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                                    global.competition = "champion-america";
                                }
                                else {
                                    global.competition = "other";
                                }
                                ;
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/teamSlug'), (global.teamSlug));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/team'), (global.team));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/teamUrl'), (global.teamUrl));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/leagueslug'), (global.leagueslug));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/competition'), (global.competition));
                            }
                        }
                        if (userOfferSent[i].sendCardOffers != null) {
                            for (let g = 0; g < nbOffertSentCards; g++) {
                                const id = userOfferSent[i].sendCardOffers[g].id;
                                const rarete = userOfferSent[i].sendCardOffers[g].card.rarity;
                                const age = userOfferSent[i].sendCardOffers[g].card.age;
                                const cardSlug = userOfferSent[i].sendCardOffers[g].card.slug;
                                const position = userOfferSent[i].sendCardOffers[g].card.player.position;
                                const cardName = userOfferSent[i].sendCardOffers[g].card.name;
                                const cardPicture = userOfferSent[i].sendCardOffers[g].card.pictureUrl;
                                const displayName = userOfferSent[i].sendCardOffers[g].card.player.displayName;
                                const playerSlug = userOfferSent[i].sendCardOffers[g].card.player.slug;
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/id'), (id));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/id'), (id));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/rarete'), (rarete));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/age'), (age));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/cardSlug'), (cardSlug));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/cardName'), (cardName));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/cardPicture'), (cardPicture));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/displayName'), (displayName));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/playerSlug'), (playerSlug));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/position'), (position));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/transfert'), ("sent"));
                                if (userOfferSent[i].sendCardOffers[g].card.player.activeClub != null) {
                                    global.teamSlug = userOfferSent[i].sendCardOffers[g].card.player.activeClub.slug;
                                    global.team = userOfferSent[i].sendCardOffers[g].card.player.activeClub.name;
                                }
                                else {
                                    global.teamSlug = "";
                                    global.team = "";
                                }
                                if (userOfferSent[i].sendCardOffers[g].card.player.activeClub.pictureUrl != null) {
                                    global.teamUrl = userOfferSent[i].sendCardOffers[g].card.player.activeClub.pictureUrl;
                                }
                                else {
                                    global.teamUrl = "";
                                }
                                if (userOfferSent[i].sendCardOffers[g].card.player.activeClub.domesticLeague.slug != null) {
                                    global.leagueslug = userOfferSent[i].sendCardOffers[g].card.player.activeClub.domesticLeague.slug;
                                }
                                else {
                                    global.league = "other";
                                }
                                ;
                                if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                                    global.competition = "champion-europe";
                                }
                                else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                                    global.competition = "challenger-europe";
                                }
                                else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                                    global.competition = "champion-asia";
                                }
                                else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                                    global.competition = "champion-america";
                                }
                                else {
                                    global.competition = "other";
                                }
                                ;
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/teamSlug'), (global.teamSlug));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/team'), (global.team));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/teamUrl'), (global.teamUrl));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/leagueslug'), (global.leagueslug));
                                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/competition'), (global.competition));
                            }
                        }
                    }
                }
                const allBalanceReceived = tabBalanceReceived.reduce(reducer).toFixed(3);
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/watching/balanceReceived'), (+allBalanceReceived));
                // #####SAVE HISTORY WALLET#####
                axios_1.default.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=EUR,USD&api_key=3407e811098c81482681d5f96768abacdaa1d3415dfd6f0befe66550a44b65a3').then(resp => {
                    global.ethValue = resp.data;
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/watching/ethValue'), (resp.data));
                    global.ethValue = resp.data;
                });
                (0, database_1.onValue)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/'), (snapshot) => {
                    const wallet = snapshot.val();
                    if (wallet.historique != undefined) {
                        const nbHistory = wallet.historique.length;
                        // set(ref(getDatabase(), global.user+'/profil/historique/'+nbHistory),(wallet.watching));
                        // set(ref(getDatabase(), global.user+'/profil/historique/'+nbHistory+'/date'),(Date()));
                    }
                    else {
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/historique/0/date'), (Date()));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/historique/0/balanceReceived'), (0));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/historique/0/balanceSent'), (0));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/historique/0/totalAuctions'), (0));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/historique/0/totalValueWallet'), (0));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/historique/0/totalWallet'), (0));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/historique/0/ethValue'), ({ EUR: 0, USD: 0 }));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/historique/1/'), (wallet.watching));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil//historique/1/date'), (Date()));
                    }
                    //   const points = wallet.points;
                    //   const newPoints = points-10;
                    //   set(ref(getDatabase(), global.user+'/profil/points'),(newPoints));
                    //   console.log(newPoints)
                }, { onlyOnce: true });
                // onValue(ref(getDatabase(), global.user+'/mycards/lockedprice'), (snapshot:DataSnapshot) => {
                //   global.myLockedPrice = snapshot.val();
                //   if(global.myLockedPrice != undefined){
                //   for(let g=0; g<global.myLockedPrice.length; g++){
                //     if(global.myLockedPrice[g].cardSlug === global.cardslug){
                //       global.priceAchat = global.myLockedPrice[g].priceLocked;
                //       global.lock="lock"
                //       }
                //     }
                //   }
                // },{onlyOnce: true});
                console.log("Toutes les data de cartes de : " + global.user + ' import??es');
                return response.status;
            });
        });
    });
});
// ########################  REQUETES  ##############################
// ################################################################
// #########################  CARDS  ######################
router.get('/api/cards', (req, res) => {
    const user_token = req.query.token;
    const user = req.query.user;
    // cron.schedule('00 03  * *  *', function() {
    function main() {
        return __awaiter(this, void 0, void 0, function* () {
            const endpoint = 'https://api.sorare.com/graphql';
            const graphQLClient = new graphql_request_1.GraphQLClient(endpoint, {
                headers: {
                    Authorization: 'Bearer ' + user_token + '',
                    'content-type': 'application/json'
                },
            });
            const GET_WALLET_CURRENT_USER = (0, graphql_request_1.gql) `
      query current_user{
        currentUser{
          totalBalance
          cardCounts{
            limited
            rare
            superRare
            unique
          }
          directOffers(direction:SENT){
            totalCount
            nodes{
              aasmState
              id
              creditCardFee
              acceptedAt
              sendWeiAmount
              sendCardOffers{
                id
                card{
                  rarity
                  age
                  slug
                  name
                  pictureUrl
                  player{
                    displayName
                    slug
                    position
                    age
                    activeClub{
                      pictureUrl
                      slug
                      name
                        domesticLeague{
                        slug
                      }
                    }
                  }
                }
              }
            }
          }
          wonEnglishAuctions(sortByEndDate:DESC){
            totalCount
            nodes{
              id
              name
              currentPrice
              creditCardFee
              endDate
              cards{
                rarity
                pictureUrl
                slug
                player{
                  displayName
                  slug
                  position
                  age
                  activeClub{
                    pictureUrl
                    slug
                    name
                    domesticLeague{
                      slug
                    }
                  }
                }
              }
            }
           }    
          paginatedCards(first:300){
            nodes{
              rarity
              player{
                position
                slug
                displayName
                age
                activeClub{
                  pictureUrl
                  name
                  slug
                  domesticLeague{
                    slug
                  }
                }
              }
              grade
              onSale
              ownerSince
              xp
              owner{
                from
                price
                transferType
              }
              name
              slug
              pictureUrl
            }
          }
        }
      }
      `;
            const GET_DIRECT_OFFER_RECEIVE_CURRENT_USER = (0, graphql_request_1.gql) `
      query direct_offer{
        currentUser{
          directOffers(direction:RECEIVED){
            totalCount
            nodes{
              aasmState
              id
              creditCardFee
              acceptedAt
              sendWeiAmount
              receiveWeiAmount
              sendCardOffers{
                  id
                card{
                  rarity
                  age
                  slug
                  name
                  pictureUrl
                  player{
                    displayName
                    slug
                    position
                    age
                    activeClub{
                      pictureUrl
                      slug
                      name
                        domesticLeague{
                        slug
                      }
                    }
                  }
                }
              }
              receiveCardOffers{
                id
                card{
                  rarity
                  age
                  slug
                  name
                  pictureUrl
                  player{
                    displayName
                    slug
                    position
                    age
                    activeClub{
                      pictureUrl
                      slug
                      name
                        domesticLeague{
                        slug
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      `;
            const GET_DIRECT_OFFER_SENT_CURRENT_USER = (0, graphql_request_1.gql) `
      query direct_offer{
        currentUser{
          directOffers(direction:SENT){
            totalCount
            nodes{
              aasmState
              id
              creditCardFee
              acceptedAt
              sendWeiAmount
              receiveWeiAmount
              sendCardOffers{
                  id
                card{
                  rarity
                  age
                  slug
                  name
                  pictureUrl
                  player{
                    displayName
                    slug
                    position
                    age
                    activeClub{
                      pictureUrl
                      slug
                      name
                        domesticLeague{
                        slug
                      }
                    }
                  }
                }
              }
              receiveCardOffers{
                id
                card{
                  rarity
                  age
                  slug
                  name
                  pictureUrl
                  player{
                    displayName
                    slug
                    position
                    age
                    activeClub{
                      pictureUrl
                      slug
                      name
                        domesticLeague{
                        slug
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      `;
            const dbRef = (0, database_1.ref)((0, database_1.getDatabase)());
            const userWallet = yield graphQLClient.request(GET_WALLET_CURRENT_USER);
            const myCards = userWallet.currentUser.paginatedCards.nodes;
            const nbRarityCards = userWallet.currentUser.cardCounts;
            const nbCards = myCards.length;
            const userAuctions = userWallet.currentUser.wonEnglishAuctions.nodes;
            const nbAuctions = userAuctions.length;
            var allMyCards = [];
            var tabAllAuctions = [0];
            var tabBalanceSent = [0];
            var tabBalanceReceived = [0];
            var tabAllValue = [0];
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/'), (""));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction'), (""));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers'), (""));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/nombreCards'), (nbRarityCards));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/totalWallet'), (userWallet.currentUser.totalBalance / Math.pow(10, 18)));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/lastRefresh'), (Date()));
            const reducer = (previousValue, currentValue) => previousValue + currentValue;
            // #####################################
            // paginatedCards(first:300)############
            (0, database_1.get)((0, database_1.child)(dbRef, user + '/mycards/lockedprice')).then((snapshot) => {
                if (snapshot.exists()) {
                    const myCardsLock = snapshot.val();
                    global.cardsLockArray = [];
                    for (let i = 0; i < myCardsLock.length; i++) {
                        global.cardsLockArray.push(myCardsLock[i].cardSlug, myCardsLock[i].priceLocked);
                    }
                }
                else {
                }
            }).catch((error) => {
                console.error(error);
            });
            for (let i = 0; i < nbCards; i++) {
                if (myCards[i].rarity != "common") {
                    allMyCards.push(myCards[i]);
                }
            }
            const nbCardqRarity = allMyCards.length;
            for (let i = 0; i < nbCardqRarity; i++) {
                const playername = allMyCards[i].player.displayName;
                const age = allMyCards[i].player.age;
                const position = allMyCards[i].player.position;
                const dateAchat = allMyCards[i].ownerSince;
                const playerslug = allMyCards[i].player.slug;
                const Url = allMyCards[i].pictureUrl;
                const rarity = allMyCards[i].rarity;
                global.cardslug = allMyCards[i].slug;
                const getOnSale = allMyCards[i].onSale;
                const grade = allMyCards[i].grade;
                const xp = allMyCards[i].xp;
                const transferType = allMyCards[i].owner.transferType;
                global.priceAchat = (allMyCards[i].owner.price) / Math.pow(10, 18);
                global.lock = "lock_open";
                if (allMyCards[i].player.activeClub.domesticLeague.slug != null) {
                    global.leagueslug = allMyCards[i].player.activeClub.domesticLeague.slug;
                }
                else {
                    global.leagueslug = "other";
                }
                ;
                if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                    global.competition = "champion-europe";
                }
                else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leagueslug === "ukrainian-premier-league") {
                    global.competition = "challenger-europe";
                }
                else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                    global.competition = "champion-asia";
                }
                else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                    global.competition = "champion-america";
                }
                else {
                    global.competition = "other";
                }
                ;
                if (allMyCards[i].player.activeClub.pictureUrl != null) {
                    global.team = allMyCards[i].player.activeClub.name;
                    global.teamUrl = allMyCards[i].player.activeClub.pictureUrl;
                }
                else {
                    global.teamUrl = "";
                    global.team = "";
                }
                const docRef = (0, firestore_2.doc)((0, firestore_1.getFirestore)(), "players", global.competition, position, playerslug);
                const docSnap = yield (0, firestore_1.getDoc)(docRef);
                if (docSnap.exists()) {
                    global.noteSorareManger = docSnap.data().noteBetSorare;
                    if (rarity === "limited") {
                        global.lastValue = docSnap.data().priceLimited, global.onSale = docSnap.data().onSaleLimited;
                    }
                    else if (rarity === "rare") {
                        global.lastValue = docSnap.data().priceRare, global.onSale = docSnap.data().onSaleRare;
                    }
                }
                else {
                    // doc.data() will be undefined in this case
                    global.lastValue = 0;
                }
                ;
                tabAllValue.push(global.lastValue);
                if (global.cardsLockArray != undefined && global.cardsLockArray.includes(global.cardslug)) {
                    global.cardsLockArray.indexOf(global.cardslug);
                    const findIndex = global.cardsLockArray.indexOf(global.cardslug) + 1;
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/locked'), ("lock"));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/priceAchat'), (global.cardsLockArray[findIndex]));
                }
                else {
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/locked'), (global.lock));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/priceAchat'), (global.priceAchat));
                }
                ;
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/playername'), (playername));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/age'), (age));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/position'), (position));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/dateAchat'), (dateAchat));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/Url'), (Url));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/rarete'), (rarity));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/cardslug'), (global.cardslug));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/onSale'), (getOnSale));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/grade'), (grade));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/xp'), (xp));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/playerslug'), (playerslug));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/transferType'), (transferType));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/league'), (global.leagueslug));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/competition'), (global.competition));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/lastValue'), (global.lastValue));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/onSale'), (global.onSale));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/rentapotent'), (global.lastValue - global.priceAchat));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/teamUrl'), (global.teamUrl));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/team'), (global.team));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/noteSorareManger'), (global.noteSorareManger));
                if (global.priceAchat != 0) {
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/rentapotentPercent'), (((global.lastValue - global.priceAchat)) / global.priceAchat) * 100);
                }
                else {
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/rentapotentPercent'), (100));
                }
            }
            const allValue = tabAllValue.reduce(reducer).toFixed(3);
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/totalValueWallet'), (+allValue));
            // ##############################
            // wonEnglishAuctions############
            for (let i = 0; i < nbAuctions; i++) {
                const auctionsCard = userAuctions[i].cards[0];
                const nbCardsAuction = userAuctions[i].cards.length;
                const cardName = userAuctions[i].name;
                const currentPrice = userAuctions[i].currentPrice / Math.pow(10, 18);
                tabAllAuctions.push(userAuctions[i].currentPrice / Math.pow(10, 18));
                const creditCardFee = userAuctions[i].creditCardFee;
                const endDate = userAuctions[i].endDate;
                const id = userAuctions[i].id;
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/cardName'), (cardName));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/currentPrice'), (currentPrice));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/endDate'), (endDate));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/id'), (id));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/creditCardFee'), (creditCardFee));
                for (let g = 0; g < nbCardsAuction; g++) {
                    const cardSlug = userAuctions[i].cards[g].slug;
                    const rarete = userAuctions[i].cards[g].rarity;
                    const cardPicture = userAuctions[i].cards[g].pictureUrl;
                    const playerSlug = userAuctions[i].cards[g].player.slug;
                    const playerName = userAuctions[i].cards[g].player.displayName;
                    const position = userAuctions[i].cards[g].player.position;
                    const age = userAuctions[i].cards[g].player.age;
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/cardSlug'), (cardSlug));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/cardPicture'), (cardPicture));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/playerSlug'), (playerSlug));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/playerName'), (playerName));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/position'), (position));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/rarete'), (rarete));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/age'), (age));
                }
                const cardSlug = auctionsCard.slug;
                const rarete = auctionsCard.rarity;
                const cardPicture = auctionsCard.pictureUrl;
                const playerSlug = auctionsCard.player.slug;
                const playerName = auctionsCard.player.displayName;
                const position = auctionsCard.player.position;
                const age = auctionsCard.player.age;
                if (auctionsCard.player.activeClub != null) {
                    global.teamSlug = auctionsCard.player.activeClub.slug;
                    global.team = auctionsCard.player.activeClub.name;
                }
                else {
                    global.teamSlug = "";
                    global.team = "";
                }
                if (auctionsCard.player.activeClub.pictureUrl != null) {
                    global.teamUrl = auctionsCard.player.activeClub.pictureUrl;
                }
                else {
                    global.teamUrl = "";
                }
                if (auctionsCard.player.activeClub.domesticLeague.slug != null) {
                    global.leagueslug = allMyCards[i].player.activeClub.domesticLeague.slug;
                }
                else {
                    global.league = "other";
                }
                ;
                if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                    global.competition = "champion-europe";
                }
                else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                    global.competition = "challenger-europe";
                }
                else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                    global.competition = "champion-asia";
                }
                else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                    global.competition = "champion-america";
                }
                else {
                    global.competition = "other";
                }
                ;
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/teamSlug'), (global.teamSlug));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/team'), (global.team));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/teamUrl'), (global.teamUrl));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/leagueslug'), (global.leagueslug));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/competition'), (global.competition));
            }
            const allAuctions = tabAllAuctions.reduce(reducer).toFixed(3);
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/totalAuctions'), (+allAuctions));
            // ########################################
            // directOffers(direction:SENT)############
            const userOfferWallet = yield graphQLClient.request(GET_DIRECT_OFFER_RECEIVE_CURRENT_USER);
            const userOfferReceived = userOfferWallet.currentUser.directOffers.nodes;
            const nbOfferSReceived = userOfferReceived.length;
            let f = -1;
            for (let i = 0; i < nbOfferSReceived; i++) {
                const aasmState = userOfferReceived[i].aasmState;
                if (aasmState === "accepted") {
                    f++;
                    const id = userOfferReceived[i].id;
                    const creditCardFee = userOfferReceived[i].creditCardFee;
                    const acceptedAt = userOfferReceived[i].acceptedAt;
                    const sendWeiAmount = userOfferReceived[i].sendWeiAmount;
                    const receiveWeiAmount = userOfferReceived[i].receiveWeiAmount;
                    const nbOffertReceiveCards = userOfferReceived[i].receiveCardOffers.length;
                    const nbOffertSentCards = userOfferReceived[i].sendCardOffers.length;
                    tabBalanceSent.push((sendWeiAmount - receiveWeiAmount) / Math.pow(10, 18));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/transfert'), ("sent"));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/id'), (id));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/creditCardFee'), (creditCardFee));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/acceptedAt'), (acceptedAt));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receiveWeiAmount'), (sendWeiAmount / Math.pow(10, 18)));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sendWeiAmount'), (receiveWeiAmount / Math.pow(10, 18)));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/balance'), ((sendWeiAmount - receiveWeiAmount) / Math.pow(10, 18)));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/nbOffertCards'), (nbOffertSentCards));
                    if (userOfferReceived[i].receiveCardOffers != null) {
                        for (let g = 0; g < nbOffertReceiveCards; g++) {
                            const id = userOfferReceived[i].receiveCardOffers[g].id;
                            const rarete = userOfferReceived[i].receiveCardOffers[g].card.rarity;
                            const age = userOfferReceived[i].receiveCardOffers[g].card.age;
                            const cardSlug = userOfferReceived[i].receiveCardOffers[g].card.slug;
                            const position = userOfferReceived[i].receiveCardOffers[g].card.player.position;
                            const cardName = userOfferReceived[i].receiveCardOffers[g].card.name;
                            const cardPicture = userOfferReceived[i].receiveCardOffers[g].card.pictureUrl;
                            const displayName = userOfferReceived[i].receiveCardOffers[g].card.player.displayName;
                            const playerSlug = userOfferReceived[i].receiveCardOffers[g].card.player.slug;
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/id'), (id));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/id'), (id));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/rarete'), (rarete));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/age'), (age));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/cardSlug'), (cardSlug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/cardName'), (cardName));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/cardPicture'), (cardPicture));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/displayName'), (displayName));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/playerSlug'), (playerSlug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/position'), (position));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/transfert'), ("received"));
                            if (userOfferReceived[i].receiveCardOffers[g].card.player.activeClub != null) {
                                global.teamSlug = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.slug;
                                global.team = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.name;
                            }
                            else {
                                global.teamSlug = "";
                                global.team = "";
                            }
                            if (userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.pictureUrl != null) {
                                global.teamUrl = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.pictureUrl;
                            }
                            else {
                                global.teamUrl = "";
                            }
                            if (userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.domesticLeague.slug != null) {
                                global.leagueslug = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.domesticLeague.slug;
                            }
                            else {
                                global.league = "other";
                            }
                            ;
                            if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                                global.competition = "champion-europe";
                            }
                            else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                                global.competition = "challenger-europe";
                            }
                            else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                                global.competition = "champion-asia";
                            }
                            else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                                global.competition = "champion-america";
                            }
                            else {
                                global.competition = "other";
                            }
                            ;
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/teamSlug'), (global.teamSlug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/team'), (global.team));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/teamUrl'), (global.teamUrl));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/leagueslug'), (global.leagueslug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/competition'), (global.competition));
                        }
                    }
                    if (userOfferReceived[i].sendCardOffers != null) {
                        for (let g = 0; g < nbOffertSentCards; g++) {
                            const id = userOfferReceived[i].sendCardOffers[g].id;
                            const rarete = userOfferReceived[i].sendCardOffers[g].card.rarity;
                            const age = userOfferReceived[i].sendCardOffers[g].card.age;
                            const cardSlug = userOfferReceived[i].sendCardOffers[g].card.slug;
                            const position = userOfferReceived[i].sendCardOffers[g].card.player.position;
                            const cardName = userOfferReceived[i].sendCardOffers[g].card.name;
                            const cardPicture = userOfferReceived[i].sendCardOffers[g].card.pictureUrl;
                            const displayName = userOfferReceived[i].sendCardOffers[g].card.player.displayName;
                            const playerSlug = userOfferReceived[i].sendCardOffers[g].card.player.slug;
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/id'), (id));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/id'), (id));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/rarete'), (rarete));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/age'), (age));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/cardSlug'), (cardSlug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/cardName'), (cardName));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/cardPicture'), (cardPicture));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/displayName'), (displayName));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/playerSlug'), (playerSlug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/position'), (position));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/transfert'), ("sent"));
                            if (userOfferReceived[i].sendCardOffers[g].card.player.activeClub != null) {
                                global.teamSlug = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.slug;
                                global.team = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.name;
                            }
                            else {
                                global.teamSlug = "";
                                global.team = "";
                            }
                            if (userOfferReceived[i].sendCardOffers[g].card.player.activeClub.pictureUrl != null) {
                                global.teamUrl = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.pictureUrl;
                            }
                            else {
                                global.teamUrl = "";
                            }
                            if (userOfferReceived[i].sendCardOffers[g].card.player.activeClub.domesticLeague.slug != null) {
                                global.leagueslug = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.domesticLeague.slug;
                            }
                            else {
                                global.league = "other";
                            }
                            ;
                            if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                                global.competition = "champion-europe";
                            }
                            else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                                global.competition = "challenger-europe";
                            }
                            else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                                global.competition = "champion-asia";
                            }
                            else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                                global.competition = "champion-america";
                            }
                            else {
                                global.competition = "other";
                            }
                            ;
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/teamSlug'), (global.teamSlug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/team'), (global.team));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/teamUrl'), (global.teamUrl));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/leagueslug'), (global.leagueslug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/competition'), (global.competition));
                        }
                    }
                }
            }
            const allBalanceSent = tabBalanceSent.reduce(reducer).toFixed(3);
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/balanceSent'), (+allBalanceSent));
            // ########################################
            // directOffers(direction:RECEIVED)############
            const userOfferSentWallet = yield graphQLClient.request(GET_DIRECT_OFFER_SENT_CURRENT_USER);
            const userOfferSent = userOfferSentWallet.currentUser.directOffers.nodes;
            const nbOfferSent = userOfferSent.length;
            let h = -1;
            for (let i = 0; i < nbOfferSent; i++) {
                const aasmState = userOfferSent[i].aasmState;
                if (aasmState === "accepted") {
                    h++;
                    const id = userOfferSent[i].id;
                    const creditCardFee = userOfferSent[i].creditCardFee;
                    const acceptedAt = userOfferSent[i].acceptedAt;
                    const sendWeiAmount = userOfferSent[i].sendWeiAmount;
                    const receiveWeiAmount = userOfferSent[i].receiveWeiAmount;
                    const nbOffertReceiveCards = userOfferSent[i].receiveCardOffers.length;
                    const nbOffertSentCards = userOfferSent[i].sendCardOffers.length;
                    tabBalanceReceived.push((receiveWeiAmount - sendWeiAmount) / Math.pow(10, 18));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/transfert'), ("received"));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/id'), (id));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/creditCardFee'), (creditCardFee));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/acceptedAt'), (acceptedAt));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sendWeiAmount'), (sendWeiAmount / Math.pow(10, 18)));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receiveWeiAmount'), (receiveWeiAmount / Math.pow(10, 18)));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/balance'), ((receiveWeiAmount - sendWeiAmount) / Math.pow(10, 18)));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/nbOffertCards'), (nbOffertSentCards));
                    if (userOfferSent[i].receiveCardOffers != null) {
                        for (let g = 0; g < nbOffertReceiveCards; g++) {
                            const id = userOfferSent[i].receiveCardOffers[g].id;
                            const rarete = userOfferSent[i].receiveCardOffers[g].card.rarity;
                            const age = userOfferSent[i].receiveCardOffers[g].card.age;
                            const cardSlug = userOfferSent[i].receiveCardOffers[g].card.slug;
                            const position = userOfferSent[i].receiveCardOffers[g].card.player.position;
                            const cardName = userOfferSent[i].receiveCardOffers[g].card.name;
                            const cardPicture = userOfferSent[i].receiveCardOffers[g].card.pictureUrl;
                            const displayName = userOfferSent[i].receiveCardOffers[g].card.player.displayName;
                            const playerSlug = userOfferSent[i].receiveCardOffers[g].card.player.slug;
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/id'), (id));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/id'), (id));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/rarete'), (rarete));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/age'), (age));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/cardSlug'), (cardSlug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/cardName'), (cardName));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/cardPicture'), (cardPicture));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/displayName'), (displayName));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/playerSlug'), (playerSlug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/position'), (position));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/transfert'), ("received"));
                            if (userOfferSent[i].receiveCardOffers[g].card.player.activeClub != null) {
                                global.teamSlug = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.slug;
                                global.team = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.name;
                            }
                            else {
                                global.teamSlug = "";
                                global.team = "";
                            }
                            if (userOfferSent[i].receiveCardOffers[g].card.player.activeClub.pictureUrl != null) {
                                global.teamUrl = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.pictureUrl;
                            }
                            else {
                                global.teamUrl = "";
                            }
                            if (userOfferSent[i].receiveCardOffers[g].card.player.activeClub.domesticLeague.slug != null) {
                                global.leagueslug = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.domesticLeague.slug;
                            }
                            else {
                                global.league = "other";
                            }
                            ;
                            if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                                global.competition = "champion-europe";
                            }
                            else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                                global.competition = "challenger-europe";
                            }
                            else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                                global.competition = "champion-asia";
                            }
                            else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                                global.competition = "champion-america";
                            }
                            else {
                                global.competition = "other";
                            }
                            ;
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/teamSlug'), (global.teamSlug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/team'), (global.team));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/teamUrl'), (global.teamUrl));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/leagueslug'), (global.leagueslug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/competition'), (global.competition));
                        }
                    }
                    if (userOfferSent[i].sendCardOffers != null) {
                        for (let g = 0; g < nbOffertSentCards; g++) {
                            const id = userOfferSent[i].sendCardOffers[g].id;
                            const rarete = userOfferSent[i].sendCardOffers[g].card.rarity;
                            const age = userOfferSent[i].sendCardOffers[g].card.age;
                            const cardSlug = userOfferSent[i].sendCardOffers[g].card.slug;
                            const position = userOfferSent[i].sendCardOffers[g].card.player.position;
                            const cardName = userOfferSent[i].sendCardOffers[g].card.name;
                            const cardPicture = userOfferSent[i].sendCardOffers[g].card.pictureUrl;
                            const displayName = userOfferSent[i].sendCardOffers[g].card.player.displayName;
                            const playerSlug = userOfferSent[i].sendCardOffers[g].card.player.slug;
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/id'), (id));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/id'), (id));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/rarete'), (rarete));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/age'), (age));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/cardSlug'), (cardSlug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/cardName'), (cardName));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/cardPicture'), (cardPicture));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/displayName'), (displayName));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/playerSlug'), (playerSlug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/position'), (position));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/transfert'), ("sent"));
                            if (userOfferSent[i].sendCardOffers[g].card.player.activeClub != null) {
                                global.teamSlug = userOfferSent[i].sendCardOffers[g].card.player.activeClub.slug;
                                global.team = userOfferSent[i].sendCardOffers[g].card.player.activeClub.name;
                            }
                            else {
                                global.teamSlug = "";
                                global.team = "";
                            }
                            if (userOfferSent[i].sendCardOffers[g].card.player.activeClub.pictureUrl != null) {
                                global.teamUrl = userOfferSent[i].sendCardOffers[g].card.player.activeClub.pictureUrl;
                            }
                            else {
                                global.teamUrl = "";
                            }
                            if (userOfferSent[i].sendCardOffers[g].card.player.activeClub.domesticLeague.slug != null) {
                                global.leagueslug = userOfferSent[i].sendCardOffers[g].card.player.activeClub.domesticLeague.slug;
                            }
                            else {
                                global.league = "other";
                            }
                            ;
                            if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                                global.competition = "champion-europe";
                            }
                            else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                                global.competition = "challenger-europe";
                            }
                            else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                                global.competition = "champion-asia";
                            }
                            else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                                global.competition = "champion-america";
                            }
                            else {
                                global.competition = "other";
                            }
                            ;
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/teamSlug'), (global.teamSlug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/team'), (global.team));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/teamUrl'), (global.teamUrl));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/leagueslug'), (global.leagueslug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/competition'), (global.competition));
                        }
                    }
                }
            }
            const allBalanceReceived = tabBalanceReceived.reduce(reducer).toFixed(3);
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/balanceReceived'), (+allBalanceReceived));
            // #####SAVE HISTORY WALLET#####
            axios_1.default.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=EUR,USD&api_key=3407e811098c81482681d5f96768abacdaa1d3415dfd6f0befe66550a44b65a3').then(resp => {
                global.ethValue = resp.data;
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/ethValue'), (resp.data));
            });
            (0, database_1.onValue)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/'), (snapshot) => {
                const wallet = snapshot.val();
                if (wallet.historique != undefined) {
                    const nbHistory = wallet.historique.length;
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/historique/' + nbHistory), (wallet.watching));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/historique/' + nbHistory + '/date'), (Date()));
                }
                else {
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/historique/0/'), (wallet.watching));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil//historique/0/date'), (Date()));
                }
            }, { onlyOnce: true });
        });
    }
    // onValue(ref(getDatabase(), user+'/mycards/lockedprice'), (snapshot:DataSnapshot) => {
    //   global.myLockedPrice = snapshot.val();
    //   if(global.myLockedPrice != undefined){
    //   for(let g=0; g<global.myLockedPrice.length; g++){
    //     if(global.myLockedPrice[g].cardSlug === global.cardslug){
    //       global.priceAchat = global.myLockedPrice[g].priceLocked;
    //       global.lock="lock"
    //       }
    //     }
    //   }
    // },{onlyOnce: true});
    console.log("Toutes les data de cartes de : " + user + ' import??es');
    main().catch((error) => console.error(error));
});
// ########################  REQUETES  ##############################
// ################################################################
// #########################  REFRESH DATA  ######################
router.get('/api/refresh', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, firestore_1.getFirestore)();
    var tabUsers = [];
    const querySnapshot = yield (0, firestore_1.getDocs)((0, firestore_1.collection)(db, "users"));
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        tabUsers.push(doc.data());
    });
    const nbUsers = tabUsers.length;
    let count = -1;
    do {
        count += 1;
        const user_token = tabUsers[count].token;
        const user = tabUsers[count].user;
        const endpoint = 'https://api.sorare.com/graphql';
        const graphQLClient = new graphql_request_1.GraphQLClient(endpoint, {
            headers: {
                Authorization: 'Bearer ' + user_token + '',
                'content-type': 'application/json'
            },
        });
        const GET_PROFIL_CURRENT_USER = (0, graphql_request_1.gql) `
        query current_user{
          currentUser{
            totalBalance
            nickname
            createdAt
            allTimeBestDecksInFormation{
              pictureUrl
            }
            profile{
              clubName
              pictureUrl
              proSince
              slug
              discordUsername
              clubBanner{
                pictureUrl
              }
            }
          }
        }
        `;
        const GET_WALLET_CURRENT_USER = (0, graphql_request_1.gql) `
        query current_user{
          currentUser{
            totalBalance
            cardCounts{
              limited
              rare
              superRare
              unique
            }
            directOffers(direction:SENT){
              totalCount
              nodes{
                aasmState
                id
                creditCardFee
                acceptedAt
                sendWeiAmount
                sendCardOffers{
                  id
                  card{
                    rarity
                    age
                    slug
                    name
                    pictureUrl
                    player{
                      displayName
                      slug
                      position
                      age
                      activeClub{
                        pictureUrl
                        slug
                        name
                          domesticLeague{
                          slug
                        }
                      }
                    }
                  }
                }
              }
            }
            wonEnglishAuctions(sortByEndDate:DESC){
              totalCount
              nodes{
                id
                name
                currentPrice
                creditCardFee
                endDate
                cards{
                  rarity
                  pictureUrl
                  slug
                  player{
                    displayName
                    slug
                    position
                    age
                    activeClub{
                      pictureUrl
                      slug
                      name
                      domesticLeague{
                        slug
                      }
                    }
                  }
                }
              }
             }    
            paginatedCards(last:300){
              nodes{
                rarity
                player{
                  position
                  slug
                  displayName
                  age
                  activeClub{
                    pictureUrl
                    name
                    slug
                    domesticLeague{
                      slug
                    }
                  }
                }
                grade
                onSale
                ownerSince
                xp
                owner{
                  from
                  price
                  transferType
                }
                name
                slug
                pictureUrl
              }
            }
          }
        }
        `;
        const GET_DIRECT_OFFER_RECEIVE_CURRENT_USER = (0, graphql_request_1.gql) `
        query direct_offer{
          currentUser{
            directOffers(direction:RECEIVED){
              totalCount
              nodes{
                aasmState
                id
                creditCardFee
                acceptedAt
                sendWeiAmount
                receiveWeiAmount
                sendCardOffers{
                    id
                  card{
                    rarity
                    age
                    slug
                    name
                    pictureUrl
                    player{
                      displayName
                      slug
                      position
                      age
                      activeClub{
                        pictureUrl
                        slug
                        name
                          domesticLeague{
                          slug
                        }
                      }
                    }
                  }
                }
                receiveCardOffers{
                  id
                  card{
                    rarity
                    age
                    slug
                    name
                    pictureUrl
                    player{
                      displayName
                      slug
                      position
                      age
                      activeClub{
                        pictureUrl
                        slug
                        name
                          domesticLeague{
                          slug
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        `;
        const GET_DIRECT_OFFER_SENT_CURRENT_USER = (0, graphql_request_1.gql) `
        query direct_offer{
          currentUser{
            directOffers(direction:SENT){
              totalCount
              nodes{
                aasmState
                id
                creditCardFee
                acceptedAt
                sendWeiAmount
                receiveWeiAmount
                sendCardOffers{
                    id
                  card{
                    rarity
                    age
                    slug
                    name
                    pictureUrl
                    player{
                      displayName
                      slug
                      position
                      age
                      activeClub{
                        pictureUrl
                        slug
                        name
                          domesticLeague{
                          slug
                        }
                      }
                    }
                  }
                }
                receiveCardOffers{
                  id
                  card{
                    rarity
                    age
                    slug
                    name
                    pictureUrl
                    player{
                      displayName
                      slug
                      position
                      age
                      activeClub{
                        pictureUrl
                        slug
                        name
                          domesticLeague{
                          slug
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        `;
        const profil = yield graphQLClient.request(GET_PROFIL_CURRENT_USER);
        const myProfil = profil.currentUser;
        console.log(myProfil);
        console.log("date: ", myProfil.createdAt);
        global.dateCreation = new Date(myProfil.createdAt);
        console.log("dateCreation: ", global.dateCreation);
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/token'), (user_token));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/nickname'), (myProfil.nickname));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/totalBalance'), (myProfil.totalBalance / Math.pow(10, 18)));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/createdAt'), (myProfil.createdAt));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/clubName'), (myProfil.profile.clubName));
        (0, database_1.onValue)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/'), (snapshot) => {
            const profil = snapshot.val();
            if (profil.points != undefined) {
                const points = profil.points;
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/points'), (points));
            }
            else {
                const points = 300;
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/points'), (points));
            }
        }, { onlyOnce: true });
        if (myProfil.profile.pictureUrl === "") {
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/pictureUrl'), ("https://firebasestorage.googleapis.com/v0/b/betsorare.appspot.com/o/avatar-unknow.png?alt=media&token=8b97f8a9-3c6b-4c46-b0f7-e9b31317d83b"));
        }
        else {
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/pictureUrl'), (myProfil.profile.pictureUrl));
        }
        if (myProfil.allTimeBestDecksInFormation[0] != null) {
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/BestDeck'), (myProfil.allTimeBestDecksInFormation[0]));
        }
        const users = (0, firestore_1.collection)(db, "users");
        yield (0, firestore_2.setDoc)((0, firestore_2.doc)(users, user), {
            Maj: Date(),
            user: user,
            token: user_token,
        });
        const dbRef = (0, database_1.ref)((0, database_1.getDatabase)());
        const userWallet = yield graphQLClient.request(GET_WALLET_CURRENT_USER);
        const myCards = userWallet.currentUser.paginatedCards.nodes;
        console.log("nombre de cartes: ", myCards.length);
        const nbRarityCards = userWallet.currentUser.cardCounts;
        const nbCards = myCards.length;
        const userAuctions = userWallet.currentUser.wonEnglishAuctions.nodes;
        const nbAuctions = userAuctions.length;
        var allMyCards = [];
        var tabAllAuctions = [0];
        var tabBalanceSent = [0];
        var tabBalanceReceived = [0];
        var tabAllValue = [0];
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/'), (""));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction'), (""));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers'), (""));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/nombreCards'), (nbRarityCards));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/totalWallet'), (userWallet.currentUser.totalBalance / Math.pow(10, 18)));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/lastRefresh'), (Date()));
        const reducer = (previousValue, currentValue) => previousValue + currentValue;
        // #####################################
        // paginatedCards(first:300)############
        (0, database_1.get)((0, database_1.child)(dbRef, user + '/mycards/lockedprice')).then((snapshot) => {
            if (snapshot.exists()) {
                const myCardsLock = snapshot.val();
                global.cardsLockArray = [];
                for (let i = 0; i < myCardsLock.length; i++) {
                    global.cardsLockArray.push(myCardsLock[i].cardSlug, myCardsLock[i].priceLocked);
                }
            }
            else {
            }
        }).catch((error) => {
            console.error(error);
        });
        for (let i = 0; i < nbCards; i++) {
            if (myCards[i].rarity != "common") {
                allMyCards.push(myCards[i]);
            }
        }
        const nbCardqRarity = allMyCards.length;
        console.log("nombre carte raret??: ", nbCardqRarity);
        for (let i = 0; i < nbCardqRarity; i++) {
            const playername = allMyCards[i].player.displayName;
            const age = allMyCards[i].player.age;
            const position = allMyCards[i].player.position;
            const dateAchat = allMyCards[i].ownerSince;
            const playerslug = allMyCards[i].player.slug;
            const Url = allMyCards[i].pictureUrl;
            const rarity = allMyCards[i].rarity;
            global.cardslug = allMyCards[i].slug;
            const getOnSale = allMyCards[i].onSale;
            const grade = allMyCards[i].grade;
            const xp = allMyCards[i].xp;
            const transferType = allMyCards[i].owner.transferType;
            global.priceAchat = (allMyCards[i].owner.price) / Math.pow(10, 18);
            global.lock = "lock_open";
            console.log(playerslug, playername);
            if (allMyCards[i].player.activeClub != null) {
                global.leagueslug = allMyCards[i].player.activeClub.domesticLeague.slug;
            }
            else {
                global.leagueslug = "other";
            }
            ;
            if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                global.competition = "champion-europe";
            }
            else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leagueslug === "ukrainian-premier-league") {
                global.competition = "challenger-europe";
            }
            else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                global.competition = "champion-asia";
            }
            else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                global.competition = "champion-america";
            }
            else {
                global.competition = "other";
            }
            ;
            if (allMyCards[i].player.activeClub != null) {
                global.team = allMyCards[i].player.activeClub.name;
                global.teamUrl = allMyCards[i].player.activeClub.pictureUrl;
            }
            else {
                global.teamUrl = "";
                global.team = "";
            }
            const docRef = (0, firestore_2.doc)((0, firestore_1.getFirestore)(), "players", global.competition, position, playerslug);
            const docSnap = yield (0, firestore_1.getDoc)(docRef);
            if (docSnap.exists()) {
                global.noteSorareManger = docSnap.data().noteBetSorare;
                if (rarity === "limited") {
                    global.lastValue = docSnap.data().priceLimited, global.onSale = docSnap.data().onSaleLimited;
                }
                else if (rarity === "rare") {
                    global.lastValue = docSnap.data().priceRare, global.onSale = docSnap.data().onSaleRare;
                }
            }
            else {
                // doc.data() will be undefined in this case
                global.lastValue = 0;
            }
            ;
            tabAllValue.push(global.lastValue);
            if (global.cardsLockArray != undefined && global.cardsLockArray.includes(global.cardslug)) {
                global.cardsLockArray.indexOf(global.cardslug);
                const findIndex = global.cardsLockArray.indexOf(global.cardslug) + 1;
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/locked'), ("lock"));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/priceAchat'), (global.cardsLockArray[findIndex]));
            }
            else {
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/locked'), (global.lock));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/priceAchat'), (global.priceAchat));
            }
            ;
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/playername'), (playername));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/age'), (age));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/position'), (position));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/dateAchat'), (dateAchat));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/Url'), (Url));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/rarete'), (rarity));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/cardslug'), (global.cardslug));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/onSale'), (getOnSale));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/grade'), (grade));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/xp'), (xp));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/playerslug'), (playerslug));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/transferType'), (transferType));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/league'), (global.leagueslug));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/competition'), (global.competition));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/lastValue'), (global.lastValue));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/onSale'), (global.onSale));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/rentapotent'), (global.lastValue - global.priceAchat));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/teamUrl'), (global.teamUrl));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/team'), (global.team));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/noteSorareManger'), (global.noteSorareManger));
            if (global.priceAchat != 0) {
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/rentapotentPercent'), (((global.lastValue - global.priceAchat)) / global.priceAchat) * 100);
            }
            else {
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/rentapotentPercent'), (100));
            }
        }
        const allValue = tabAllValue.reduce(reducer).toFixed(3);
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/totalValueWallet'), (+allValue));
        // ##############################
        // wonEnglishAuctions############
        for (let i = 0; i < nbAuctions; i++) {
            const auctionsCard = userAuctions[i].cards[0];
            const nbCardsAuction = userAuctions[i].cards.length;
            const cardName = userAuctions[i].name;
            const currentPrice = userAuctions[i].currentPrice / Math.pow(10, 18);
            tabAllAuctions.push(userAuctions[i].currentPrice / Math.pow(10, 18));
            const creditCardFee = userAuctions[i].creditCardFee;
            const endDate = userAuctions[i].endDate;
            const id = userAuctions[i].id;
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/cardName'), (cardName));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/currentPrice'), (currentPrice));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/endDate'), (endDate));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/id'), (id));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/creditCardFee'), (creditCardFee));
            for (let g = 0; g < nbCardsAuction; g++) {
                const cardSlug = userAuctions[i].cards[g].slug;
                const rarete = userAuctions[i].cards[g].rarity;
                const cardPicture = userAuctions[i].cards[g].pictureUrl;
                const playerSlug = userAuctions[i].cards[g].player.slug;
                const playerName = userAuctions[i].cards[g].player.displayName;
                const position = userAuctions[i].cards[g].player.position;
                const age = userAuctions[i].cards[g].player.age;
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/cardSlug'), (cardSlug));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/cardPicture'), (cardPicture));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/playerSlug'), (playerSlug));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/playerName'), (playerName));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/position'), (position));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/rarete'), (rarete));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/age'), (age));
            }
            const cardSlug = auctionsCard.slug;
            const rarete = auctionsCard.rarity;
            const cardPicture = auctionsCard.pictureUrl;
            const playerSlug = auctionsCard.player.slug;
            const playerName = auctionsCard.player.displayName;
            const position = auctionsCard.player.position;
            const age = auctionsCard.player.age;
            console.log(cardSlug);
            if (auctionsCard.player.activeClub != null) {
                global.teamSlug = auctionsCard.player.activeClub.slug;
                global.team = auctionsCard.player.activeClub.name;
            }
            else {
                global.teamSlug = "";
                global.team = "";
            }
            if (auctionsCard.player.activeClub != null) {
                global.teamUrl = auctionsCard.player.activeClub.pictureUrl;
            }
            else {
                global.teamUrl = "";
            }
            if (auctionsCard.player.activeClub = null) {
                global.leagueslug = allMyCards[i].player.activeClub.domesticLeague.slug;
            }
            else {
                global.league = "other";
            }
            ;
            if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                global.competition = "champion-europe";
            }
            else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                global.competition = "challenger-europe";
            }
            else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                global.competition = "champion-asia";
            }
            else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                global.competition = "champion-america";
            }
            else {
                global.competition = "other";
            }
            ;
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/teamSlug'), (global.teamSlug));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/team'), (global.team));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/teamUrl'), (global.teamUrl));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/leagueslug'), (global.leagueslug));
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/competition'), (global.competition));
        }
        const allAuctions = tabAllAuctions.reduce(reducer).toFixed(3);
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/totalAuctions'), (+allAuctions));
        // ########################################
        // directOffers(direction:SENT)############
        const userOfferWallet = yield graphQLClient.request(GET_DIRECT_OFFER_RECEIVE_CURRENT_USER);
        const userOfferReceived = userOfferWallet.currentUser.directOffers.nodes;
        const nbOfferSReceived = userOfferReceived.length;
        let f = -1;
        for (let i = 0; i < nbOfferSReceived; i++) {
            const aasmState = userOfferReceived[i].aasmState;
            if (aasmState === "accepted") {
                f++;
                const id = userOfferReceived[i].id;
                const creditCardFee = userOfferReceived[i].creditCardFee;
                const acceptedAt = userOfferReceived[i].acceptedAt;
                const sendWeiAmount = userOfferReceived[i].sendWeiAmount;
                const receiveWeiAmount = userOfferReceived[i].receiveWeiAmount;
                const nbOffertReceiveCards = userOfferReceived[i].receiveCardOffers.length;
                const nbOffertSentCards = userOfferReceived[i].sendCardOffers.length;
                tabBalanceSent.push((sendWeiAmount - receiveWeiAmount) / Math.pow(10, 18));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/transfert'), ("sent"));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/id'), (id));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/creditCardFee'), (creditCardFee));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/acceptedAt'), (acceptedAt));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receiveWeiAmount'), (sendWeiAmount / Math.pow(10, 18)));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sendWeiAmount'), (receiveWeiAmount / Math.pow(10, 18)));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/balance'), ((sendWeiAmount - receiveWeiAmount) / Math.pow(10, 18)));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/nbOffertCards'), (nbOffertSentCards));
                if (userOfferReceived[i].receiveCardOffers != null) {
                    for (let g = 0; g < nbOffertReceiveCards; g++) {
                        const id = userOfferReceived[i].receiveCardOffers[g].id;
                        const rarete = userOfferReceived[i].receiveCardOffers[g].card.rarity;
                        const age = userOfferReceived[i].receiveCardOffers[g].card.age;
                        const cardSlug = userOfferReceived[i].receiveCardOffers[g].card.slug;
                        const position = userOfferReceived[i].receiveCardOffers[g].card.player.position;
                        const cardName = userOfferReceived[i].receiveCardOffers[g].card.name;
                        const cardPicture = userOfferReceived[i].receiveCardOffers[g].card.pictureUrl;
                        const displayName = userOfferReceived[i].receiveCardOffers[g].card.player.displayName;
                        const playerSlug = userOfferReceived[i].receiveCardOffers[g].card.player.slug;
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/id'), (id));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/id'), (id));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/rarete'), (rarete));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/age'), (age));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/cardSlug'), (cardSlug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/cardName'), (cardName));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/cardPicture'), (cardPicture));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/displayName'), (displayName));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/playerSlug'), (playerSlug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/position'), (position));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/transfert'), ("received"));
                        if (userOfferReceived[i].receiveCardOffers[g].card.player.activeClub != null) {
                            global.teamSlug = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.slug;
                            global.team = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.name;
                        }
                        else {
                            global.teamSlug = "";
                            global.team = "";
                        }
                        if (userOfferReceived[i].receiveCardOffers[g].card.player.activeClub != null) {
                            global.teamUrl = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.pictureUrl;
                        }
                        else {
                            global.teamUrl = "";
                        }
                        if (userOfferReceived[i].receiveCardOffers[g].card.player.activeClub != null) {
                            global.leagueslug = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.domesticLeague.slug;
                        }
                        else {
                            global.league = "other";
                        }
                        ;
                        if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                            global.competition = "champion-europe";
                        }
                        else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                            global.competition = "challenger-europe";
                        }
                        else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                            global.competition = "champion-asia";
                        }
                        else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                            global.competition = "champion-america";
                        }
                        else {
                            global.competition = "other";
                        }
                        ;
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/teamSlug'), (global.teamSlug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/team'), (global.team));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/teamUrl'), (global.teamUrl));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/leagueslug'), (global.leagueslug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/competition'), (global.competition));
                    }
                }
                if (userOfferReceived[i].sendCardOffers != null) {
                    for (let g = 0; g < nbOffertSentCards; g++) {
                        const id = userOfferReceived[i].sendCardOffers[g].id;
                        const rarete = userOfferReceived[i].sendCardOffers[g].card.rarity;
                        const age = userOfferReceived[i].sendCardOffers[g].card.age;
                        const cardSlug = userOfferReceived[i].sendCardOffers[g].card.slug;
                        const position = userOfferReceived[i].sendCardOffers[g].card.player.position;
                        const cardName = userOfferReceived[i].sendCardOffers[g].card.name;
                        const cardPicture = userOfferReceived[i].sendCardOffers[g].card.pictureUrl;
                        const displayName = userOfferReceived[i].sendCardOffers[g].card.player.displayName;
                        const playerSlug = userOfferReceived[i].sendCardOffers[g].card.player.slug;
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/id'), (id));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/id'), (id));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/rarete'), (rarete));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/age'), (age));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/cardSlug'), (cardSlug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/cardName'), (cardName));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/cardPicture'), (cardPicture));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/displayName'), (displayName));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/playerSlug'), (playerSlug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/position'), (position));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/transfert'), ("sent"));
                        if (userOfferReceived[i].sendCardOffers[g].card.player.activeClub != null) {
                            global.teamSlug = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.slug;
                            global.team = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.name;
                        }
                        else {
                            global.teamSlug = "";
                            global.team = "";
                        }
                        if (userOfferReceived[i].sendCardOffers[g].card.player.activeClub != null) {
                            global.teamUrl = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.pictureUrl;
                        }
                        else {
                            global.teamUrl = "";
                        }
                        if (userOfferReceived[i].sendCardOffers[g].card.player.activeClub != null) {
                            global.leagueslug = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.domesticLeague.slug;
                        }
                        else {
                            global.league = "other";
                        }
                        ;
                        if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                            global.competition = "champion-europe";
                        }
                        else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                            global.competition = "challenger-europe";
                        }
                        else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                            global.competition = "champion-asia";
                        }
                        else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                            global.competition = "champion-america";
                        }
                        else {
                            global.competition = "other";
                        }
                        ;
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/teamSlug'), (global.teamSlug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/team'), (global.team));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/teamUrl'), (global.teamUrl));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/leagueslug'), (global.leagueslug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/competition'), (global.competition));
                    }
                }
            }
        }
        const allBalanceSent = tabBalanceSent.reduce(reducer).toFixed(3);
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/balanceSent'), (+allBalanceSent));
        // ########################################
        // directOffers(direction:RECEIVED)############
        const userOfferSentWallet = yield graphQLClient.request(GET_DIRECT_OFFER_SENT_CURRENT_USER);
        const userOfferSent = userOfferSentWallet.currentUser.directOffers.nodes;
        const nbOfferSent = userOfferSent.length;
        let h = -1;
        for (let i = 0; i < nbOfferSent; i++) {
            const aasmState = userOfferSent[i].aasmState;
            if (aasmState === "accepted") {
                h++;
                const id = userOfferSent[i].id;
                const creditCardFee = userOfferSent[i].creditCardFee;
                const acceptedAt = userOfferSent[i].acceptedAt;
                const sendWeiAmount = userOfferSent[i].sendWeiAmount;
                const receiveWeiAmount = userOfferSent[i].receiveWeiAmount;
                const nbOffertReceiveCards = userOfferSent[i].receiveCardOffers.length;
                const nbOffertSentCards = userOfferSent[i].sendCardOffers.length;
                tabBalanceReceived.push((receiveWeiAmount - sendWeiAmount) / Math.pow(10, 18));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/transfert'), ("received"));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/id'), (id));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/creditCardFee'), (creditCardFee));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/acceptedAt'), (acceptedAt));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sendWeiAmount'), (sendWeiAmount / Math.pow(10, 18)));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receiveWeiAmount'), (receiveWeiAmount / Math.pow(10, 18)));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/balance'), ((receiveWeiAmount - sendWeiAmount) / Math.pow(10, 18)));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/nbOffertCards'), (nbOffertSentCards));
                if (userOfferSent[i].receiveCardOffers != null) {
                    for (let g = 0; g < nbOffertReceiveCards; g++) {
                        const id = userOfferSent[i].receiveCardOffers[g].id;
                        const rarete = userOfferSent[i].receiveCardOffers[g].card.rarity;
                        const age = userOfferSent[i].receiveCardOffers[g].card.age;
                        const cardSlug = userOfferSent[i].receiveCardOffers[g].card.slug;
                        const position = userOfferSent[i].receiveCardOffers[g].card.player.position;
                        const cardName = userOfferSent[i].receiveCardOffers[g].card.name;
                        const cardPicture = userOfferSent[i].receiveCardOffers[g].card.pictureUrl;
                        const displayName = userOfferSent[i].receiveCardOffers[g].card.player.displayName;
                        const playerSlug = userOfferSent[i].receiveCardOffers[g].card.player.slug;
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/id'), (id));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/id'), (id));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/rarete'), (rarete));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/age'), (age));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/cardSlug'), (cardSlug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/cardName'), (cardName));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/cardPicture'), (cardPicture));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/displayName'), (displayName));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/playerSlug'), (playerSlug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/position'), (position));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/transfert'), ("received"));
                        if (userOfferSent[i].receiveCardOffers[g].card.player.activeClub != null) {
                            global.teamSlug = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.slug;
                            global.team = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.name;
                        }
                        else {
                            global.teamSlug = "";
                            global.team = "";
                        }
                        if (userOfferSent[i].receiveCardOffers[g].card.player.activeClub != null) {
                            global.teamUrl = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.pictureUrl;
                        }
                        else {
                            global.teamUrl = "";
                        }
                        if (userOfferSent[i].receiveCardOffers[g].card.player.activeClub != null) {
                            global.leagueslug = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.domesticLeague.slug;
                        }
                        else {
                            global.league = "other";
                        }
                        ;
                        if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                            global.competition = "champion-europe";
                        }
                        else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                            global.competition = "challenger-europe";
                        }
                        else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                            global.competition = "champion-asia";
                        }
                        else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                            global.competition = "champion-america";
                        }
                        else {
                            global.competition = "other";
                        }
                        ;
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/teamSlug'), (global.teamSlug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/team'), (global.team));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/teamUrl'), (global.teamUrl));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/leagueslug'), (global.leagueslug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/competition'), (global.competition));
                    }
                }
                if (userOfferSent[i].sendCardOffers != null) {
                    for (let g = 0; g < nbOffertSentCards; g++) {
                        const id = userOfferSent[i].sendCardOffers[g].id;
                        const rarete = userOfferSent[i].sendCardOffers[g].card.rarity;
                        const age = userOfferSent[i].sendCardOffers[g].card.age;
                        const cardSlug = userOfferSent[i].sendCardOffers[g].card.slug;
                        const position = userOfferSent[i].sendCardOffers[g].card.player.position;
                        const cardName = userOfferSent[i].sendCardOffers[g].card.name;
                        const cardPicture = userOfferSent[i].sendCardOffers[g].card.pictureUrl;
                        const displayName = userOfferSent[i].sendCardOffers[g].card.player.displayName;
                        const playerSlug = userOfferSent[i].sendCardOffers[g].card.player.slug;
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/id'), (id));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/id'), (id));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/rarete'), (rarete));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/age'), (age));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/cardSlug'), (cardSlug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/cardName'), (cardName));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/cardPicture'), (cardPicture));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/displayName'), (displayName));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/playerSlug'), (playerSlug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/position'), (position));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/transfert'), ("sent"));
                        if (userOfferSent[i].sendCardOffers[g].card.player.activeClub != null) {
                            global.teamSlug = userOfferSent[i].sendCardOffers[g].card.player.activeClub.slug;
                            global.team = userOfferSent[i].sendCardOffers[g].card.player.activeClub.name;
                        }
                        else {
                            global.teamSlug = "";
                            global.team = "";
                        }
                        if (userOfferSent[i].sendCardOffers[g].card.player.activeClub != null) {
                            global.teamUrl = userOfferSent[i].sendCardOffers[g].card.player.activeClub.pictureUrl;
                        }
                        else {
                            global.teamUrl = "";
                        }
                        if (userOfferSent[i].sendCardOffers[g].card.player.activeClub != null) {
                            global.leagueslug = userOfferSent[i].sendCardOffers[g].card.player.activeClub.domesticLeague.slug;
                        }
                        else {
                            global.league = "other";
                        }
                        ;
                        if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                            global.competition = "champion-europe";
                        }
                        else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                            global.competition = "challenger-europe";
                        }
                        else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                            global.competition = "champion-asia";
                        }
                        else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                            global.competition = "champion-america";
                        }
                        else {
                            global.competition = "other";
                        }
                        ;
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/teamSlug'), (global.teamSlug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/team'), (global.team));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/teamUrl'), (global.teamUrl));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/leagueslug'), (global.leagueslug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/competition'), (global.competition));
                    }
                }
            }
        }
        const allBalanceReceived = tabBalanceReceived.reduce(reducer).toFixed(3);
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/balanceReceived'), (+allBalanceReceived));
        // // #####SAVE HISTORY WALLET#####
        axios_1.default.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=EUR,USD&api_key=3407e811098c81482681d5f96768abacdaa1d3415dfd6f0befe66550a44b65a3').then(resp => {
            global.ethValue = resp.data;
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/ethValue'), (resp.data));
        });
        (0, database_1.onValue)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/'), (snapshot) => {
            const wallet = snapshot.val();
            if (wallet.historique != undefined) {
                const nbHistory = wallet.historique.length;
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/historique/' + nbHistory), (wallet.watching));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/historique/' + nbHistory + '/date'), (Date()));
            }
            else {
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/historique/0/date'), (global.dateCreation));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/historique/0/balanceReceived'), (0));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/historique/0/balanceSent'), (0));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/historique/0/totalAuctions'), (0));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/historique/0/totalValueWallet'), (0));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/historique/0/totalWallet'), (0));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil/historique/1/'), (wallet.watching));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), global.user + '/profil//historique/1/date'), (Date()));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/historique/0/'), (wallet.watching));
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil//historique/0/date'), (Date()));
            }
            const points = wallet.points;
            const newPoints = points - 10;
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/points'), (newPoints));
            console.log(newPoints);
        }, { onlyOnce: true });
        console.log("Toutes les data de cartes de : " + user + ' import??es');
    } while (+count < (+nbUsers - 1));
    res.redirect('/');
}));
// ################################################################
// ################################################################
// #########################  CRON   ##############################
// ################################################################
// ################################################################
// #########################  REFRESH DATA   ######################
// var myJob = new CronJob('25 1 * * *', async function(){
//   const db = getFirestore();
//   var tabUsers: any[] =[];
//   const querySnapshot = await getDocs(collection(db, "users"));
//   querySnapshot.forEach((doc) => {
//     // doc.data() is never undefined for query doc snapshots
//     tabUsers.push(doc.data())
//   });
//   const nbUsers = tabUsers.length;
//   let count = -1;
//   do{
//     count += 1;
//     const user_token = tabUsers[count].token;
//     const user = tabUsers[count].user;
//       const endpoint = 'https://api.sorare.com/graphql'
//       const graphQLClient = new GraphQLClient(endpoint, {
//         headers: {
//           Authorization: 'Bearer '+user_token+'',
//           'content-type': 'application/json'
//         },
//         })
//         const GET_PROFIL_CURRENT_USER = gql`
//         query current_user{
//           currentUser{
//             nickname
//             createdAt
//             allTimeBestDecksInFormation{
//               pictureUrl
//             }
//             totalBalance
//             cardCounts{
//               limited
//               rare
//               superRare
//               unique
//             }
//             profile{
//               clubName
//               pictureUrl
//               proSince
//               slug
//               discordUsername
//               clubBanner{
//                 pictureUrl
//               }
//             }
//           }
//         }
//         `;
//         const GET_DIRECT_OFFER_RECEIVE_CURRENT_USER = gql`
//         query direct_offer{
//           currentUser{
//             directOffers(direction:RECEIVED){
//               totalCount
//               nodes{
//                 aasmState
//                 id
//                 creditCardFee
//                 acceptedAt
//                 sendWeiAmount
//                 receiveWeiAmount
//                 sendCardOffers{
//                     id
//                   card{
//                     rarity
//                     age
//                     slug
//                     name
//                     pictureUrl
//                     player{
//                       displayName
//                       slug
//                       position
//                       age
//                       activeClub{
//                         pictureUrl
//                         slug
//                         name
//                           domesticLeague{
//                           slug
//                         }
//                       }
//                     }
//                   }
//                 }
//                 receiveCardOffers{
//                   id
//                   card{
//                     rarity
//                     age
//                     slug
//                     name
//                     pictureUrl
//                     player{
//                       displayName
//                       slug
//                       position
//                       age
//                       activeClub{
//                         pictureUrl
//                         slug
//                         name
//                           domesticLeague{
//                           slug
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//         `;
//         const GET_DIRECT_OFFER_SENT_CURRENT_USER = gql`
//         query direct_offer{
//           currentUser{
//             directOffers(direction:SENT){
//               totalCount
//               nodes{
//                 aasmState
//                 id
//                 creditCardFee
//                 acceptedAt
//                 sendWeiAmount
//                 receiveWeiAmount
//                 sendCardOffers{
//                     id
//                   card{
//                     rarity
//                     age
//                     slug
//                     name
//                     pictureUrl
//                     player{
//                       displayName
//                       slug
//                       position
//                       age
//                       activeClub{
//                         pictureUrl
//                         slug
//                         name
//                           domesticLeague{
//                           slug
//                         }
//                       }
//                     }
//                   }
//                 }
//                 receiveCardOffers{
//                   id
//                   card{
//                     rarity
//                     age
//                     slug
//                     name
//                     pictureUrl
//                     player{
//                       displayName
//                       slug
//                       position
//                       age
//                       activeClub{
//                         pictureUrl
//                         slug
//                         name
//                           domesticLeague{
//                           slug
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//         `;
//       const GET_CARDS_CURRENT_USER = gql`
//       query current_user($slug:String){
//         currentUser{
//           paginatedCards(first:50,after: $slug){
//             pageInfo {
//               hasNextPage
//               hasPreviousPage
//               endCursor
//             }
//               nodes{
//                 rarity
//                 player{
//                   position
//                   slug
//                   displayName
//                   age
//                   activeClub{
//                     pictureUrl
//                     name
//                     slug
//                     domesticLeague{
//                       slug
//                     }
//                   }
//                 }
//                 grade
//                 onSale
//                 ownerSince
//                 xp
//                 owner{
//                   from
//                   price
//                   transferType
//                 }
//                 name
//                 slug
//                 pictureUrl
//               }
//             }
//           }
//         }
//       `;
//       const GET_AUCTIONS_CURRENT_USER = gql`
//       query current_user{
//         currentUser{
//           wonEnglishAuctions(sortByEndDate:DESC){
//             totalCount
//             nodes{
//               id
//               name
//               currentPrice
//               creditCardFee
//               endDate
//               cards{
//                 rarity
//                 pictureUrl
//                 slug
//                 player{
//                   displayName
//                   slug
//                   position
//                   age
//                   activeClub{
//                     pictureUrl
//                     slug
//                     name
//                     domesticLeague{
//                       slug
//                     }
//                   }
//                 }
//               }
//             }
//            }    
//         }
//       }
//     `;
//       const GET_REWARDS_CURRENT_USER = gql`
//       query current_user($slug:String!){
//         currentUser{
//           createdAt
//          accountEntries(sortType:ASC,after:$slug){
//             pageInfo {
//               hasNextPage
//               hasPreviousPage
//               endCursor
//             }
//           nodes{
//             date
//             amount
//             operation{
//               __typename
//             }
//           }
//         }
//       }
//     }
//     `;
//           // const profil = await graphQLClient.request(GET_PROFIL_CURRENT_USER);
//           // const myProfil=profil.currentUser;
//           // console.log(myProfil);
//           // console.log("date: ",myProfil.createdAt);
//           // global.dateCreation=new Date(myProfil.createdAt);
//           // console.log("dateCreation: ",global.dateCreation);
//           // set(ref(getDatabase(), user+'/profil/token'),(user_token));
//           // set(ref(getDatabase(), user+'/profil/nickname'),(myProfil.nickname));
//           // set(ref(getDatabase(), user+'/profil/totalBalance'),(myProfil.totalBalance/Math.pow(10,18)));
//           // set(ref(getDatabase(), user+'/profil/createdAt'),(myProfil.createdAt));
//           // set(ref(getDatabase(), user+'/profil/clubName'),(myProfil.profile.clubName));
//           // onValue(ref(getDatabase(), user+'/profil/'), (snapshot:DataSnapshot) => {
//           //   const profil = snapshot.val();
//           //   if(profil.points != undefined){
//           //     const points = profil.points;
//           //     set(ref(getDatabase(), user+'/profil/points'),(points));
//           //   }else{
//           //     const points = 300;
//           //     set(ref(getDatabase(), user+'/profil/points'),(points));
//           //   }
//           // },{onlyOnce: true});  
//           // if(myProfil.profile.pictureUrl===""){
//           //   set(ref(getDatabase(), user+'/profil/pictureUrl'),("https://firebasestorage.googleapis.com/v0/b/betsorare.appspot.com/o/avatar-unknow.png?alt=media&token=8b97f8a9-3c6b-4c46-b0f7-e9b31317d83b"));
//           // }else{
//           //   set(ref(getDatabase(), user+'/profil/pictureUrl'),(myProfil.profile.pictureUrl));
//           // }
//           // if(myProfil.allTimeBestDecksInFormation[0] != null){
//           //   set(ref(getDatabase(), user+'/profil/BestDeck'),(myProfil.allTimeBestDecksInFormation[0]));
//           // }
//           // const users = collection(db,"users");
//           // await setDoc(doc(users, user),{
//           //   Maj:Date(),
//           //   user:user,
//           //   token:user_token,
//           // });
//           // const dbRef = ref(getDatabase());
//           // const nbRarityCards = myProfil.cardCounts;
//           var tabBalanceSent: any[] =[0];
//           var tabBalanceReceived: any[] =[0];
//           var tabAllValue: any[] =[0];
//           // set(ref(getDatabase(), user+'/mycards/card/'),(""));
//           // set(ref(getDatabase(), user+'/myauctions/auction'), (""));
//           // set(ref(getDatabase(), user+'/mydirectoffers'), (""));
//           // set(ref(getDatabase(), user+'/mycards/nombreCards'), (nbRarityCards));
//           // set(ref(getDatabase(), user+'/profil/watching/totalWallet'),(myProfil.totalBalance/Math.pow(10,18)));
//           // set(ref(getDatabase(), user+'/profil/lastRefresh'),(Date()));
//           const reducer = (previousValue, currentValue) => previousValue + currentValue;
//           // #####################################
//           // REWARDS############
//           var allMyRewards: any[] =[];
//           var myRewards: any[] =[];
//           global.nextPage= "";
//           do{
//             let variables
//             let slug = global.userRewardsNextPage;
//             variables = {
//                 slug: slug,
//               }
//             const accountEntries = await graphQLClient.request(GET_REWARDS_CURRENT_USER,variables);
//             const userDataCards= accountEntries.currentUser.accountEntries.nodes;
//             global.userRewardsNextPage = accountEntries.currentUser.accountEntries.pageInfo.hasNextPage;
//             const userRewardsEndCursor = accountEntries.currentUser.accountEntries.pageInfo.endCursor;
//             global.nextPage=userRewardsEndCursor;
//             const nbEntries =accountEntries.currentUser.accountEntries.nodes.length
//             for(let i=0; i<nbEntries;i++){
//               if(accountEntries.currentUser.accountEntries.nodes[i].operation["__typename"] === "So5Reward"){
//                 myRewards.push(accountEntries.currentUser.accountEntries.nodes[i])
//                 }
//               }
//             }
//           while (global.userRewardsNextPage === true)
//           ;
//           console.log("myRewards: ",myRewards)
//           // #####################################
//           // paginatedCards(first:300)############
//           // var allMyCards: any[] =[];
//           // var myCards: any[] =[];
//           // global.nextPage= "";
//           // do{
//           //   let variables
//           //   let slug = global.nextPage;
//           //   variables = {
//           //       slug: slug,
//           //     }
//           //   const userData = await graphQLClient.request(GET_CARDS_CURRENT_USER,variables);
//           //   const userDataCards= userData.currentUser.paginatedCards.nodes;
//           //   global.userDataNextPage = userData.currentUser.paginatedCards.pageInfo.hasNextPage;
//           //   const userDataEndCursor = userData.currentUser.paginatedCards.pageInfo.endCursor;
//           //   global.nextPage=userDataEndCursor;
//           //   const nbCards =userData.currentUser.paginatedCards.nodes.length
//           //   for(let i=0; i<nbCards;i++){
//           //     myCards.push(userData.currentUser.paginatedCards.nodes[i])
//           //     }
//           //   }
//           // while (global.userDataNextPage === true)
//           // ;
//           // // const allCards = await graphQLClient.request(GET_CARDS_CURRENT_USER);
//           // // const myCards=allCards.currentUser.paginatedCards.nodes;
//           // console.log("nombre de cartes: " ,myCards.length)
//           // const nbCards = myCards.length;
//           // get(child(dbRef, user+'/mycards/lockedprice')).then((snapshot) => {
//           // if (snapshot.exists()) {
//           //   const myCardsLock = snapshot.val();
//           //   global.cardsLockArray=[]
//           //   for (let i=0;i<myCardsLock.length;i++){
//           //     global.cardsLockArray.push(myCardsLock[i].cardSlug,myCardsLock[i].priceLocked)
//           //   }
//           //   } else {
//           //   }
//           // }).catch((error) => {
//           //   console.error(error);
//           // });
//           // for(let i=0; i<nbCards; i++){
//           //   if(myCards[i].rarity != "common"){
//           //     allMyCards.push(myCards[i]);
//           //   }
//           // }
//           // const nbCardqRarity = allMyCards.length;
//           // console.log("nombre carte raret??: ", nbCardqRarity)
//           // for (let i=0;i<nbCardqRarity;i++){
//           //   const playername= allMyCards[i].player.displayName;
//           //   const age= allMyCards[i].player.age;
//           //   const position= allMyCards[i].player.position;
//           //   const dateAchat = allMyCards[i].ownerSince;
//           //   const playerslug= allMyCards[i].player.slug;
//           //   const Url= allMyCards[i].pictureUrl;
//           //   const rarity= allMyCards[i].rarity;
//           //   global.cardslug= allMyCards[i].slug;
//           //   const getOnSale= allMyCards[i].onSale;
//           //   const grade= allMyCards[i].grade;
//           //   const xp= allMyCards[i].xp;
//           //   const transferType= allMyCards[i].owner.transferType;
//           //   global.priceAchat = (allMyCards[i].owner.price)/Math.pow(10,18);
//           //   global.lock="lock_open"
//           //   if(allMyCards[i].player.activeClub !=null){
//           //     if(allMyCards[i].player.activeClub.domesticLeague !=null){
//           //       global.leagueslug= allMyCards[i].player.activeClub.domesticLeague.slug;
//           //     } else{global.leagueslug="other"};
//           //   }else{global.leagueslug="other"};
//           //   if(global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander"){global.competition = "champion-europe"}
//           //   else if(global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leagueslug === "ukrainian-premier-league"){global.competition = "challenger-europe"}
//           //     else if(global.leagueslug === "j1-league" || global.leagueslug === "k-league"){global.competition = "champion-asia"}
//           //       else if(global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx"){global.competition = "champion-america"}
//           //         else{global.competition = "other"};
//           //   if(allMyCards[i].player.activeClub !=null){
//           //     global.team = allMyCards[i].player.activeClub.name;
//           //     global.teamUrl = allMyCards[i].player.activeClub.pictureUrl;
//           //   }else{global.teamUrl="";global.team =""}
//           //   const docRef = doc(getFirestore(),"players",global.competition, position, playerslug);
//           //   const docSnap = await getDoc(docRef);
//           //   if (docSnap.exists()) {
//           //     global.noteSorareManger = docSnap.data().noteBetSorare;
//           //     if(rarity==="limited"){global.lastValue = docSnap.data().priceLimited, global.onSale =docSnap.data().onSaleLimited}
//           //     else if(rarity==="rare"){global.lastValue = docSnap.data().priceRare, global.onSale =docSnap.data().onSaleRare}
//           //   } else {
//           //     global.lastValue =0;
//           //   };
//           //   tabAllValue.push(global.lastValue);
//           //   if(global.cardsLockArray!= undefined && global.cardsLockArray.includes(global.cardslug)){
//           //     global.cardsLockArray.indexOf(global.cardslug)
//           //     const findIndex = global.cardsLockArray.indexOf(global.cardslug)+1
//           //     set(ref(getDatabase(), user+'/mycards/card/'+i+'/locked'),("lock"));
//           //     set(ref(getDatabase(), user+'/mycards/card/'+i+'/priceAchat'),(global.cardsLockArray[findIndex]));
//           //   }else{
//           //     set(ref(getDatabase(), user+'/mycards/card/'+i+'/locked'),(global.lock));
//           //     set(ref(getDatabase(), user+'/mycards/card/'+i+'/priceAchat'),(global.priceAchat));
//           //   };
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/playername'),(playername));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/age'),(age));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/position'),(position));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/dateAchat'),(dateAchat));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/Url'),(Url));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/rarete'),(rarity));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/cardslug'),(global.cardslug));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/onSale'),(getOnSale));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/grade'),(grade));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/xp'),(xp));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/playerslug'),(playerslug));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/transferType'),(transferType));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/league'),(global.leagueslug));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/competition'),(global.competition));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/lastValue'),(global.lastValue));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/onSale'),(global.onSale));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/rentapotent'),(global.lastValue-global.priceAchat));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/teamUrl'),(global.teamUrl));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/team'),(global.team));
//           //   set(ref(getDatabase(), user+'/mycards/card/'+i+'/noteSorareManger'),(global.noteSorareManger));
//           //   if(global.priceAchat!=0){
//           //     set(ref(getDatabase(), user+'/mycards/card/'+i+'/rentapotentPercent'),(((global.lastValue-global.priceAchat))/global.priceAchat)*100);
//           //   }else{set(ref(getDatabase(), user+'/mycards/card/'+i+'/rentapotentPercent'),(100))}
//           // }
//           //     const allValue= tabAllValue.reduce(reducer).toFixed(3);
//           //     set(ref(getDatabase(), user+'/profil/watching/totalValueWallet'),(+allValue));  
//           // ##############################
//           // wonEnglishAuctions############
//           // var tabAllAuctions: any[] =[0];
//           // const auctions = await graphQLClient.request(GET_AUCTIONS_CURRENT_USER);
//           // const userAuctions=auctions.currentUser.wonEnglishAuctions.nodes;
//           // const nbAuctions = userAuctions.length;
//           // for(let i =0; i<nbAuctions; i++){
//           //   const auctionsCard = userAuctions[i].cards[0];
//           //   const nbCardsAuction = userAuctions[i].cards.length;
//           //   const cardName = userAuctions[i].name;
//           //   const currentPrice = userAuctions[i].currentPrice/Math.pow(10,18);
//           //   tabAllAuctions.push(userAuctions[i].currentPrice/Math.pow(10,18));
//           //   const creditCardFee = userAuctions[i].creditCardFee;
//           //   const endDate = userAuctions[i].endDate;
//           //   const id = userAuctions[i].id;
//           //   set(ref(getDatabase(), user+'/myauctions/auction/'+i+'/cardName'),(cardName));
//           //   set(ref(getDatabase(), user+'/myauctions/auction/'+i+'/currentPrice'),(currentPrice));
//           //   set(ref(getDatabase(), user+'/myauctions/auction/'+i+'/endDate'),(endDate));
//           //   set(ref(getDatabase(), user+'/myauctions/auction/'+i+'/id'),(id));
//           //   set(ref(getDatabase(), user+'/myauctions/auction/'+i+'/creditCardFee'),(creditCardFee));
//           //   for(let g =0;g<nbCardsAuction;g++){
//           //     const cardSlug = userAuctions[i].cards[g].slug;
//           //     const rarete = userAuctions[i].cards[g].rarity;
//           //     const cardPicture = userAuctions[i].cards[g].pictureUrl;
//           //     const playerSlug = userAuctions[i].cards[g].player.slug;
//           //     const playerName = userAuctions[i].cards[g].player.displayName;
//           //     const position = userAuctions[i].cards[g].player.position;
//           //     const age = userAuctions[i].cards[g].player.age;
//           //     set(ref(getDatabase(), user+'/myauctions/auction/'+i+'/auctionCards/'+g+'/cardSlug'),(cardSlug));
//           //     set(ref(getDatabase(), user+'/myauctions/auction/'+i+'/auctionCards/'+g+'/cardPicture'),(cardPicture));
//           //     set(ref(getDatabase(), user+'/myauctions/auction/'+i+'/auctionCards/'+g+'/playerSlug'),(playerSlug));
//           //     set(ref(getDatabase(), user+'/myauctions/auction/'+i+'/auctionCards/'+g+'/playerName'),(playerName));
//           //     set(ref(getDatabase(), user+'/myauctions/auction/'+i+'/auctionCards/'+g+'/position'),(position));
//           //     set(ref(getDatabase(), user+'/myauctions/auction/'+i+'/auctionCards/'+g+'/rarete'),(rarete));
//           //     set(ref(getDatabase(), user+'/myauctions/auction/'+i+'/auctionCards/'+g+'/age'),(age));
//           //   }
//           //   const cardSlug = auctionsCard.slug;
//           //   const rarete = auctionsCard.rarity;
//           //   const cardPicture = auctionsCard.pictureUrl;
//           //   const playerSlug = auctionsCard.player.slug;
//           //   const playerName = auctionsCard.player.displayName;
//           //   const position = auctionsCard.player.position;
//           //   const age = auctionsCard.player.age;
//           //   if(auctionsCard.player.activeClub !=null){
//           //     global.leagueslug= auctionsCard.player.activeClub.domesticLeague.slug;
//           //   }else{global.leagueslug="other"};
//           //   if(auctionsCard.player.activeClub!=null){
//           //     global.teamSlug = auctionsCard.player.activeClub.slug;
//           //     global.team = auctionsCard.player.activeClub.name;  
//           //   }else{global.teamSlug ="";global.team ="";}
//           //   if(auctionsCard.player.activeClub !=null){
//           //     global.teamUrl = auctionsCard.player.activeClub.pictureUrl;
//           //   }else{global.teamUrl=""}
//           //   if(auctionsCard.player.activeClub=null){
//           //     global.leagueslug= allMyCards[i].player.activeClub.domesticLeague.slug;}
//           //     else{global.league="other"};
//           //     if(global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander"){global.competition = "champion-europe"}
//           //     else if(global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league"){global.competition = "challenger-europe"}
//           //       else if(global.leagueslug === "j1-league" || global.leagueslug === "k-league"){global.competition = "champion-asia"}
//           //         else if(global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx"){global.competition = "champion-america"}
//           //           else{global.competition = "other"};
//           //   set(ref(getDatabase(), user+'/myauctions/auction/'+i+'/teamSlug'),(global.teamSlug));
//           //   set(ref(getDatabase(), user+'/myauctions/auction/'+i+'/team'),(global.team));
//           //   set(ref(getDatabase(), user+'/myauctions/auction/'+i+'/teamUrl'),(global.teamUrl));
//           //   set(ref(getDatabase(), user+'/myauctions/auction/'+i+'/leagueslug'),(global.leagueslug));
//           //   set(ref(getDatabase(), user+'/myauctions/auction/'+i+'/competition'),(global.competition));
//           // }
//           //   const allAuctions= tabAllAuctions.reduce(reducer).toFixed(3);
//           //   set(ref(getDatabase(), user+'/profil/watching/totalAuctions'),(+allAuctions));  
//           // ########################################
//           // directOffers(direction:SENT)############
//           // const userOfferWallet = await graphQLClient.request(GET_DIRECT_OFFER_RECEIVE_CURRENT_USER);
//           // const userOfferReceived = userOfferWallet.currentUser.directOffers.nodes;
//           // const nbOfferSReceived = userOfferReceived.length;
//           // let f =-1;
//           // for(let i=0; i<nbOfferSReceived; i++){
//           //   const aasmState = userOfferReceived[i].aasmState;
//           //   if(aasmState==="accepted"){
//           //   f++;
//           //   const id = userOfferReceived[i].id;
//           //   const creditCardFee = userOfferReceived[i].creditCardFee;
//           //   const acceptedAt = userOfferReceived[i].acceptedAt;
//           //   const sendWeiAmount = userOfferReceived[i].sendWeiAmount;
//           //   const receiveWeiAmount = userOfferReceived[i].receiveWeiAmount;
//           //   const nbOffertReceiveCards = userOfferReceived[i].receiveCardOffers.length;
//           //   const nbOffertSentCards = userOfferReceived[i].sendCardOffers.length;
//           //   tabBalanceSent.push((sendWeiAmount-receiveWeiAmount)/Math.pow(10,18));
//           //     set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/transfert'),("sent"));
//           //     set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/id'),(id));
//           //     set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/creditCardFee'),(creditCardFee));
//           //     set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/acceptedAt'),(acceptedAt));
//           //     set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/receiveWeiAmount'),(sendWeiAmount/Math.pow(10,18)));
//           //     set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/sendWeiAmount'),(receiveWeiAmount/Math.pow(10,18)));
//           //     set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/balance'),((sendWeiAmount-receiveWeiAmount)/Math.pow(10,18)));
//           //     set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/nbOffertCards'),(nbOffertSentCards));
//           //     if(userOfferReceived[i].receiveCardOffers!=null){
//           //       for(let g=0; g<nbOffertReceiveCards;g++){
//           //         const id = userOfferReceived[i].receiveCardOffers[g].id;
//           //         const rarete = userOfferReceived[i].receiveCardOffers[g].card.rarity;
//           //         const age = userOfferReceived[i].receiveCardOffers[g].card.age;
//           //         const cardSlug = userOfferReceived[i].receiveCardOffers[g].card.slug;
//           //         const position = userOfferReceived[i].receiveCardOffers[g].card.player.position;
//           //         const cardName = userOfferReceived[i].receiveCardOffers[g].card.name;
//           //         const cardPicture = userOfferReceived[i].receiveCardOffers[g].card.pictureUrl;
//           //         const displayName = userOfferReceived[i].receiveCardOffers[g].card.player.displayName;
//           //         const playerSlug = userOfferReceived[i].receiveCardOffers[g].card.player.slug;
//           //         set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/receivedCards/'+g+'/id'),(id));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/receivedCards/'+g+'/id'),(id));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/receivedCards/'+g+'/rarete'),(rarete));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/receivedCards/'+g+'/age'),(age));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/receivedCards/'+g+'/cardSlug'),(cardSlug));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/receivedCards/'+g+'/cardName'),(cardName));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/receivedCards/'+g+'/cardPicture'),(cardPicture));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/receivedCards/'+g+'/displayName'),(displayName));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/receivedCards/'+g+'/playerSlug'),(playerSlug));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/receivedCards/'+g+'/position'),(position));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/receivedCards/'+g+'/transfert'),("received"));
//           //         if(userOfferReceived[i].receiveCardOffers[g].card.player.activeClub!=null){
//           //           global.teamSlug = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.slug;
//           //           global.team = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.name;  
//           //         }else{global.teamSlug ="";global.team ="";}
//           //         if(userOfferReceived[i].receiveCardOffers[g].card.player.activeClub !=null){
//           //           global.teamUrl = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.pictureUrl;
//           //         }else{global.teamUrl=""}
//           //         if(userOfferReceived[i].receiveCardOffers[g].card.player.activeClub !=null){
//           //           global.leagueslug= userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.domesticLeague.slug;}
//           //           else{global.league="other"};
//           //           if(global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander"){global.competition = "champion-europe"}
//           //           else if(global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league"){global.competition = "challenger-europe"}
//           //             else if(global.leagueslug === "j1-league" || global.leagueslug === "k-league"){global.competition = "champion-asia"}
//           //               else if(global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx"){global.competition = "champion-america"}
//           //                 else{global.competition = "other"};
//           //         set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/receivedCards/'+g+'/teamSlug'),(global.teamSlug));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/receivedCards/'+g+'/team'),(global.team));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/receivedCards/'+g+'/teamUrl'),(global.teamUrl));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/receivedCards/'+g+'/leagueslug'),(global.leagueslug));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/receivedCards/'+g+'/competition'),(global.competition));
//           //       }
//           //     }
//           //       if(userOfferReceived[i].sendCardOffers!=null){
//           //         for(let g=0; g<nbOffertSentCards;g++){
//           //           const id = userOfferReceived[i].sendCardOffers[g].id;
//           //           const rarete = userOfferReceived[i].sendCardOffers[g].card.rarity;
//           //           const age = userOfferReceived[i].sendCardOffers[g].card.age;
//           //           const cardSlug = userOfferReceived[i].sendCardOffers[g].card.slug;
//           //           const position = userOfferReceived[i].sendCardOffers[g].card.player.position;
//           //           const cardName = userOfferReceived[i].sendCardOffers[g].card.name;
//           //           const cardPicture = userOfferReceived[i].sendCardOffers[g].card.pictureUrl;
//           //           const displayName = userOfferReceived[i].sendCardOffers[g].card.player.displayName;
//           //           const playerSlug = userOfferReceived[i].sendCardOffers[g].card.player.slug;
//           //           set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/sentCards/'+g+'/id'),(id));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/sentCards/'+g+'/id'),(id));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/sentCards/'+g+'/rarete'),(rarete));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/sentCards/'+g+'/age'),(age));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/sentCards/'+g+'/cardSlug'),(cardSlug));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/sentCards/'+g+'/cardName'),(cardName));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/sentCards/'+g+'/cardPicture'),(cardPicture));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/sentCards/'+g+'/displayName'),(displayName));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/sentCards/'+g+'/playerSlug'),(playerSlug));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/sentCards/'+g+'/position'),(position));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/sentCards/'+g+'/transfert'),("sent"));
//           //           if(userOfferReceived[i].sendCardOffers[g].card.player.activeClub!=null){
//           //             global.teamSlug = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.slug;
//           //             global.team = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.name;  
//           //           }else{global.teamSlug ="";global.team ="";}
//           //           if(userOfferReceived[i].sendCardOffers[g].card.player.activeClub !=null){
//           //             global.teamUrl = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.pictureUrl;
//           //           }else{global.teamUrl=""}
//           //           if(userOfferReceived[i].sendCardOffers[g].card.player.activeClub !=null){
//           //             global.leagueslug= userOfferReceived[i].sendCardOffers[g].card.player.activeClub.domesticLeague.slug;}
//           //             else{global.league="other";global.leagueslug="other"};
//           //             if(global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander"){global.competition = "champion-europe"}
//           //             else if(global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league"){global.competition = "challenger-europe"}
//           //               else if(global.leagueslug === "j1-league" || global.leagueslug === "k-league"){global.competition = "champion-asia"}
//           //                 else if(global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx"){global.competition = "champion-america"}
//           //                   else{global.competition = "other"};
//           //           set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/sentCards/'+g+'/teamSlug'),(global.teamSlug));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/sentCards/'+g+'/team'),(global.team));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/sentCards/'+g+'/teamUrl'),(global.teamUrl));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/sentCards/'+g+'/leagueslug'),(global.leagueslug));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/sent/'+f+'/sentCards/'+g+'/competition'),(global.competition));
//           //         }
//           //       }
//           //     }
//           //   }
//           //       const allBalanceSent= tabBalanceSent.reduce(reducer).toFixed(3);
//           //       set(ref(getDatabase(), user+'/profil/watching/balanceSent'),(+allBalanceSent));
//               // ########################################
//           // directOffers(direction:RECEIVED)############
//           // const userOfferSentWallet = await graphQLClient.request(GET_DIRECT_OFFER_SENT_CURRENT_USER);
//           // const userOfferSent = userOfferSentWallet.currentUser.directOffers.nodes;
//           // const nbOfferSent = userOfferSent.length;
//           // let h =-1;
//           // for(let i=0; i<nbOfferSent; i++){
//           //   const aasmState = userOfferSent[i].aasmState;
//           //   if(aasmState==="accepted"){
//           //   h++;
//           //   const id = userOfferSent[i].id;
//           //   const creditCardFee = userOfferSent[i].creditCardFee;
//           //   const acceptedAt = userOfferSent[i].acceptedAt;
//           //   const sendWeiAmount = userOfferSent[i].sendWeiAmount;
//           //   const receiveWeiAmount = userOfferSent[i].receiveWeiAmount;
//           //   const nbOffertReceiveCards = userOfferSent[i].receiveCardOffers.length;
//           //   const nbOffertSentCards = userOfferSent[i].sendCardOffers.length;
//           //   tabBalanceReceived.push((receiveWeiAmount-sendWeiAmount)/Math.pow(10,18));
//           //     set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/transfert'),("received"));
//           //     set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/id'),(id));
//           //     set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/creditCardFee'),(creditCardFee));
//           //     set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/acceptedAt'),(acceptedAt));
//           //     set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/sendWeiAmount'),(sendWeiAmount/Math.pow(10,18)));
//           //     set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/receiveWeiAmount'),(receiveWeiAmount/Math.pow(10,18)));
//           //     set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/balance'),((receiveWeiAmount-sendWeiAmount)/Math.pow(10,18)));
//           //     set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/nbOffertCards'),(nbOffertSentCards));
//           //     if(userOfferSent[i].receiveCardOffers!=null){
//           //       for(let g=0; g<nbOffertReceiveCards;g++){
//           //         const id = userOfferSent[i].receiveCardOffers[g].id;
//           //         const rarete = userOfferSent[i].receiveCardOffers[g].card.rarity;
//           //         const age = userOfferSent[i].receiveCardOffers[g].card.age;
//           //         const cardSlug = userOfferSent[i].receiveCardOffers[g].card.slug;
//           //         const position = userOfferSent[i].receiveCardOffers[g].card.player.position;
//           //         const cardName = userOfferSent[i].receiveCardOffers[g].card.name;
//           //         const cardPicture = userOfferSent[i].receiveCardOffers[g].card.pictureUrl;
//           //         const displayName = userOfferSent[i].receiveCardOffers[g].card.player.displayName;
//           //         const playerSlug = userOfferSent[i].receiveCardOffers[g].card.player.slug;
//           //         set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/receivedCards/'+g+'/id'),(id));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/receivedCards/'+g+'/id'),(id));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/receivedCards/'+g+'/rarete'),(rarete));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/receivedCards/'+g+'/age'),(age));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/receivedCards/'+g+'/cardSlug'),(cardSlug));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/receivedCards/'+g+'/cardName'),(cardName));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/receivedCards/'+g+'/cardPicture'),(cardPicture));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/receivedCards/'+g+'/displayName'),(displayName));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/receivedCards/'+g+'/playerSlug'),(playerSlug));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/receivedCards/'+g+'/position'),(position));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/receivedCards/'+g+'/transfert'),("received"));
//           //         if(userOfferSent[i].receiveCardOffers[g].card.player.activeClub!=null){
//           //           global.teamSlug = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.slug;
//           //           global.team = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.name;  
//           //         }else{global.teamSlug ="";global.team ="";}
//           //         if(userOfferSent[i].receiveCardOffers[g].card.player.activeClub !=null){
//           //           global.teamUrl = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.pictureUrl;
//           //         }else{global.teamUrl=""}
//           //         if(userOfferSent[i].receiveCardOffers[g].card.player.activeClub !=null){
//           //           global.leagueslug= userOfferSent[i].receiveCardOffers[g].card.player.activeClub.domesticLeague.slug;}
//           //           else{global.league="other"};
//           //           if(global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander"){global.competition = "champion-europe"}
//           //           else if(global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league"){global.competition = "challenger-europe"}
//           //             else if(global.leagueslug === "j1-league" || global.leagueslug === "k-league"){global.competition = "champion-asia"}
//           //               else if(global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx"){global.competition = "champion-america"}
//           //                 else{global.competition = "other"};
//           //         set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/receivedCards/'+g+'/teamSlug'),(global.teamSlug));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/receivedCards/'+g+'/team'),(global.team));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/receivedCards/'+g+'/teamUrl'),(global.teamUrl));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/receivedCards/'+g+'/leagueslug'),(global.leagueslug));
//           //         set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/receivedCards/'+g+'/competition'),(global.competition));
//           //       }
//           //     }
//           //       if(userOfferSent[i].sendCardOffers!=null){
//           //         for(let g=0; g<nbOffertSentCards;g++){
//           //           const id = userOfferSent[i].sendCardOffers[g].id;
//           //           const rarete = userOfferSent[i].sendCardOffers[g].card.rarity;
//           //           const age = userOfferSent[i].sendCardOffers[g].card.age;
//           //           const cardSlug = userOfferSent[i].sendCardOffers[g].card.slug;
//           //           const position = userOfferSent[i].sendCardOffers[g].card.player.position;
//           //           const cardName = userOfferSent[i].sendCardOffers[g].card.name;
//           //           const cardPicture = userOfferSent[i].sendCardOffers[g].card.pictureUrl;
//           //           const displayName = userOfferSent[i].sendCardOffers[g].card.player.displayName;
//           //           const playerSlug = userOfferSent[i].sendCardOffers[g].card.player.slug;
//           //           set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/sentCards/'+g+'/id'),(id));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/sentCards/'+g+'/id'),(id));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/sentCards/'+g+'/rarete'),(rarete));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/sentCards/'+g+'/age'),(age));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/sentCards/'+g+'/cardSlug'),(cardSlug));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/sentCards/'+g+'/cardName'),(cardName));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/sentCards/'+g+'/cardPicture'),(cardPicture));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/sentCards/'+g+'/displayName'),(displayName));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/sentCards/'+g+'/playerSlug'),(playerSlug));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/sentCards/'+g+'/position'),(position));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/sentCards/'+g+'/transfert'),("sent"));
//           //           if(userOfferSent[i].sendCardOffers[g].card.player.activeClub!=null){
//           //             global.teamSlug = userOfferSent[i].sendCardOffers[g].card.player.activeClub.slug;
//           //             global.team = userOfferSent[i].sendCardOffers[g].card.player.activeClub.name;  
//           //           }else{global.teamSlug ="";global.team ="";}
//           //           if(userOfferSent[i].sendCardOffers[g].card.player.activeClub !=null){
//           //             global.teamUrl = userOfferSent[i].sendCardOffers[g].card.player.activeClub.pictureUrl;
//           //           }else{global.teamUrl=""}
//           //           if(userOfferSent[i].sendCardOffers[g].card.player.activeClub !=null){
//           //             global.leagueslug= userOfferSent[i].sendCardOffers[g].card.player.activeClub.domesticLeague.slug;}
//           //             else{global.league="other"};
//           //             if(global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander"){global.competition = "champion-europe"}
//           //             else if(global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league"){global.competition = "challenger-europe"}
//           //               else if(global.leagueslug === "j1-league" || global.leagueslug === "k-league"){global.competition = "champion-asia"}
//           //                 else if(global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx"){global.competition = "champion-america"}
//           //                   else{global.competition = "other"};
//           //           set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/sentCards/'+g+'/teamSlug'),(global.teamSlug));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/sentCards/'+g+'/team'),(global.team));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/sentCards/'+g+'/teamUrl'),(global.teamUrl));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/sentCards/'+g+'/leagueslug'),(global.leagueslug));
//           //           set(ref(getDatabase(), user+'/mydirectoffers/received/'+h+'/sentCards/'+g+'/competition'),(global.competition));
//           //         }
//           //       }
//           //     }
//           //   }
//           //     const allBalanceReceived= tabBalanceReceived.reduce(reducer).toFixed(3);
//           //     set(ref(getDatabase(), user+'/profil/watching/balanceReceived'),(+allBalanceReceived));
//             // #####SAVE HISTORY WALLET#####
//             // axios.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=EUR,USD&api_key=3407e811098c81482681d5f96768abacdaa1d3415dfd6f0befe66550a44b65a3').then(resp => {  
//             //   global.ethValue=resp.data;
//             //   set(ref(getDatabase(), user+'/profil/watching/ethValue'),(resp.data));
//             //   onValue(ref(getDatabase(), user+'/profil/'), (snapshot:DataSnapshot) => {
//             //     const wallet = snapshot.val();
//             //     if(wallet.historique != undefined){
//             //     const nbHistory = wallet.historique.length
//             //     set(ref(getDatabase(), user+'/profil/historique/'+nbHistory),(wallet.watching));
//             //     set(ref(getDatabase(), user+'/profil/historique/'+nbHistory+'/date'),(Date()));
//             //     }else{
//             //       set(ref(getDatabase(), user+'/profil/historique/0/date'),(Date()));
//             //       set(ref(getDatabase(), user+'/profil/historique/0/balanceReceived'),(0));
//             //       set(ref(getDatabase(), user+'/profil/historique/0/balanceSent'),(0));
//             //       set(ref(getDatabase(), user+'/profil/historique/0/totalAuctions'),(0));
//             //       set(ref(getDatabase(), user+'/profil/historique/0/totalValueWallet'),(0));
//             //       set(ref(getDatabase(), user+'/profil/historique/0/totalWallet'),(0));
//             //       set(ref(getDatabase(), user+'/profil/historique/0/ethValue'),(resp.data));
//             //       set(ref(getDatabase(), user+'/profil/historique/1/'),(wallet.watching));
//             //       set(ref(getDatabase(), user+'/profil//historique/1/date'),(Date()));
//             //     }
//             //     const points = wallet.points;
//             //     const newPoints = points-10;
//             //     set(ref(getDatabase(), user+'/profil/points'),(newPoints));
//             //     console.log(newPoints)
//             //   },{onlyOnce: true});  
//             // });
//             console.log("Toutes les data de cartes de : " + user+ ' import??es');
//     }
//     while (+count < (+nbUsers-1))
//     ;
//   });
//   myJob.start();
// ################################################################
// ################################################################
// #########################  REFRESH PLAYERS   ######################
var myJob1 = new cron_1.CronJob('0 2 * * *', function () {
    return __awaiter(this, void 0, void 0, function* () {
        function main() {
            return __awaiter(this, void 0, void 0, function* () {
                const endpoint = 'https://api.sorare.com/graphql';
                const graphQLClient = new graphql_request_1.GraphQLClient(endpoint, {
                    headers: {
                        authorization: 'Bearer mtps42938jsQu3-kuE88Z5Bk9-bZzHwvwLAd14-xG4Y',
                        APIKEY: '411b4c69a0cb415c93cabba1abfd650a92dc2b5916d6ff82d837044658c56686f928a96fe86074051eaa53732c236386ac38588504bc1f73ef508c4c422sr128',
                        'content-type': 'application/json'
                    },
                });
                const GET_All_PLAYERS = (0, graphql_request_1.gql) `
    query clubs{
    releasedPlayerValues{
        displayName
        draftValue
        slug
    }
    }
    `;
                const GET_PLAYERS = (0, graphql_request_1.gql) `
    query players($slug:String!){
    player(slug: $slug ){
        status{
            playingStatus
          }
          cardSupply{
            season{
              startYear
            }
            limited
            rare
            superRare
            unique
          }       
        displayName
        slug
        age
        appearances
        position
        pictureUrl
        activeClub{
        country{
            slug
        }
        name
        slug
        pictureUrl
        domesticLeague{
            slug
            name
        }
        }
        activeNationalTeam{
        name
        pictureSecondaryUrl
        }
        allSo5Scores (first:15){
        nodes{
          score	
          detailedScore{
          category
          stat
          totalScore
          }
        }
        }
        gameStats(last:40){
        minsPlayed
        }
        status {
        lastFifteenSo5AverageScore
        lastFiveSo5Appearances
        lastFiveSo5AverageScore
        lastFifteenSo5Appearances
        }
        cards(first:1){
        nodes{
        pictureUrl
        }
        }
        cardSampleUrl(rarity :"limited")

    }
    }`;
                const GET_PRICE = (0, graphql_request_1.gql) `
    query price($slugs:[String!]!){
        cards(slugs:$slugs){
          slug
          pictureUrl
          onSale
                  liveSingleSaleOffer{
              price
              priceInFiat{
                eur}
              endDate
            }
        }
      }
    `;
                const GET_CARD_RARE = (0, graphql_request_1.gql) `
    query card_rare ($slug:String!){
    player(slug: $slug ){
        cardSampleUrl(rarity:"rare")
        }
    }
    `;
                const GET_CARD_COMMON = (0, graphql_request_1.gql) `
    query card_rare ($slug:String!){
    player(slug: $slug ){
        cardSampleUrl(rarity:"common")
        }
    }
    `;
                const GET_RESULTATS = (0, graphql_request_1.gql) `
    query players($slug:String!){
    player(slug: $slug ){
        allSo5Scores (first:15){
        nodes{
            score
            }
        }
        gameStats(last:15){
        minsPlayed
            }
        }
    }
    `;
                const dbRef = (0, database_1.ref)((0, database_1.getDatabase)());
                const data = yield graphQLClient.request(GET_All_PLAYERS);
                const day = 60 * 60 * 24 * 1000;
                var datatoday = new Date();
                let todate;
                var datatodays = datatoday.setDate(new Date(datatoday).getDate() + 1);
                todate = new Date(datatodays);
                const allPlayers = data.releasedPlayerValues;
                const nbPlayersLicense = allPlayers.length;
                var allPlayersLicence = [];
                let count = -1;
                let variables;
                for (let i = 0; i < nbPlayersLicense; i++) {
                    allPlayersLicence.push(allPlayers[i].slug);
                }
                const tabPlayers = allPlayersLicence;
                const nbPlayers = tabPlayers.length;
                //MODIFIER COUNT POUR AUGMENTER TAILLE BDD//////////////////////
                do {
                    count += 1;
                    let slug = tabPlayers[count];
                    variables = {
                        slug: slug,
                    };
                    try {
                        const playerData = yield graphQLClient.request(GET_PLAYERS, variables);
                        const get_player = playerData.player;
                        const playername = get_player.displayName;
                        if (get_player.activeClub != null) {
                            const age = get_player.age;
                            const position = get_player.position;
                            const playerslug = get_player.slug;
                            console.log(count, playerslug, "etape1");
                            console.log(count, playername, "etape1");
                            if (get_player.status != null && get_player.status.playingStatus != null) {
                                global.statut = get_player.status.playingStatus;
                                ////set(ref(getDatabase(),'/test/clubsReady/' +count+ '/status'),(global.statut));
                            }
                            else {
                                global.statut = "";
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/status'),(global.statut));
                            }
                            ;
                            if (get_player.allSo5Scores.nodes != undefined) {
                                global.allSo5Scores = get_player.allSo5Scores.nodes;
                            }
                            else {
                                global.allSo5Scores = [];
                            }
                            const sl5 = Math.round(get_player.status.lastFiveSo5AverageScore);
                            const sl15 = Math.round(get_player.status.lastFifteenSo5AverageScore);
                            const tj15 = Math.round(((get_player.status.lastFifteenSo5Appearances) / 15) * 100);
                            const tj5 = Math.round(((get_player.status.lastFiveSo5Appearances) / 5) * 100);
                            // /#### A MODIFIER POUR LE SCORE AA########
                            let sdsl5 = 18;
                            let sdsl15 = 18;
                            let saal5 = 18;
                            let saal15 = 18;
                            // /#### A MODIFIER POUR LE SCORE AA########
                            console.log(sl5, sl15, tj5, tj15);
                            console.log(count, "etape2");
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/Maj'),(Date()));
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/country'),("false"));
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/sl5'),(sl5));
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/sl15'),(sl15));
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/tj5'),(tj5));
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/tj15'),(tj15));
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/position'),(position));
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/playerslug'),(playerslug));
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/playername'),(playername));
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/age'),(age));
                            if (get_player.activeClub.domesticLeague != null && get_player.activeClub.domesticLeague.slug != null) {
                                global.leagueslug = get_player.activeClub.domesticLeague.slug;
                                global.teamleague = get_player.activeClub.domesticLeague.name;
                                global.competition = "";
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/teamleague'),(global.teamleague));
                                if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                                    global.competition = "champion-europe";
                                }
                                else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leagueslug === "ukrainian-premier-league") {
                                    global.competition = "challenger-europe";
                                }
                                else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                                    global.competition = "champion-asia";
                                }
                                else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                                    global.competition = "champion-america";
                                }
                                else {
                                    global.competition = "other";
                                }
                                ;
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/competition'),(global.competition));
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/leagueslug'),(global.leagueslug));
                            }
                            else {
                                global.teamleague = "";
                                global.leagueslug = "";
                                global.competition = "other";
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/teamleague'),(""));
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/competition'),(""));
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/leagueslug'),(""));
                            }
                            if (get_player.activeNationalTeam != null) {
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/nationalteamname'),(get_player.activeNationalTeam.name));
                                global.nationalteamname = get_player.activeNationalTeam.name;
                            }
                            else {
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/nationalteamname'),(""));
                                global.nationalteamname = "";
                            }
                            ;
                            if (get_player.pictureUrl != null) {
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/playerpictureURL'),(get_player.pictureUrl));
                                global.playerpictureURL = get_player.pictureUrl;
                            }
                            else {
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/playerpictureURL'),(""));
                                global.playerpictureURL = "";
                            }
                            ;
                            if (get_player.activeClub != null && get_player.activeClub.pictureUrl != null) {
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/teampictureURL'),(get_player.activeClub.pictureUrl));
                                global.teampictureURL = get_player.activeClub.pictureUrl;
                            }
                            else {
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/teampictureURL'),(""));
                                global.teampictureURL = "";
                            }
                            ;
                            if (get_player.cardSampleUrl != null) {
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardpicturelimited'),(get_player.cardSampleUrl));
                                global.cardpicturelimited = get_player.cardSampleUrl;
                            }
                            else {
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardpicturelimited'),(""));
                                global.cardpicturelimited = "";
                            }
                            ;
                            if (get_player.activeNationalTeam != null && get_player.activeNationalTeam.pictureSecondaryUrl) {
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/nationalteamPicture'),(get_player.activeNationalTeam.pictureSecondaryUrl));
                                global.nationalteamPicture = get_player.activeNationalTeam.pictureSecondaryUrl;
                            }
                            else {
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/nationalteamPicture'),(""));
                                global.nationalteamPicture = "";
                            }
                            ;
                            if (get_player.activeClub != null) {
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/teamname'),(get_player.activeClub.name));
                                global.teamname = get_player.activeClub.name;
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/teamslug'),(get_player.activeClub.slug));
                                global.teamslug = get_player.activeClub.slug;
                            }
                            else {
                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/teamslug'),(""));
                                global.teamname = "";
                                global.teamslug = "";
                            }
                            ;
                            // /#### A MODIFIER POUR LE SCORE AA########
                            console.log(count, "etape3");
                            //   let detailScore: any[] =[];
                            //   let detailScore5: any[] =[];
                            //   let detailScore15: any[] =[];
                            //   const reducer = (previousValue: number, currentValue: number) => previousValue + currentValue;
                            //   if(get_player.allSo5Scores.nodes.length===0){
                            //     sdsl5=0;
                            //     sdsl15=0;
                            //     saal15=0;
                            //     saal5=0;  
                            // }else{
                            //   if (get_player.allSo5Scores.nodes.length < get_player.status.lastFiveSo5Appearances){
                            //     global.nbApparence5=get_player.allSo5Scores.nodes.length
                            //   }else{
                            //     global.nbApparence5=get_player.status.lastFiveSo5Appearances
                            //   }
                            //   for (let j = 0; j < global.nbApparence5; j++)
                            //     {
                            //       detailScore5.push(get_player.allSo5Scores.nodes[j].detailedScore[0].totalScore)
                            //       console.log(detailScore5)
                            //     }; 
                            //       sdsl5 = Math.round(detailScore5.reduce(reducer)/+global.nbApparence5);
                            //       saal5 = +sl5-(sdsl5);
                            //       console.log(sl5,sdsl5,saal5)
                            //   if (get_player.allSo5Scores.nodes.length < get_player.status.lastFifteenSo5Appearances){
                            //     global.nbApparence15=get_player.allSo5Scores.nodes.length
                            //   }else{
                            //     global.nbApparence15=get_player.status.lastFifteenSo5Appearances
                            //   }
                            //   for (let j = 0; j < global.nbApparence15; j++) 
                            //   {
                            //     detailScore15.push(get_player.allSo5Scores.nodes[j].detailedScore[0].totalScore)
                            //     console.log(detailScore15)
                            //   };
                            //   sdsl15 = Math.round(detailScore15.reduce(reducer)/+global.nbApparence15s);
                            //   saal15 = +sl15-(sdsl15);
                            //   console.log(sl15,sdsl15,saal15)                  
                            // }
                            // /#### A MODIFIER POUR LE SCORE AA########
                            console.log(count, "etape3-2");
                            //Notation saalx & sdslx
                            //#######################
                            const baremeNoteSadx = [[0, -1], [0.5, 5], [1, 8], [1.5, 10], [2, 15], [2.5, 18], [3, 22], [3.5, 25], [4, 35], [4.5, 50], [5, 99]];
                            //Notation Tjx
                            //#######################
                            const baremeNoteTjx = [[0, -1], [0.5, 46], [1, 51], [1.5, 56], [2, 61], [2.5, 66], [3, 71], [3.5, 76], [4, 81], [4.5, 86], [5, 99]];
                            //Notation Slx
                            const baremeNoteSlx = [[0, -1], [0.5, 40], [1, 50], [1.5, 55], [2, 60], [2.5, 65], [3, 70], [3.5, 75], [4, 80], [4.5, 85], [5, 99]];
                            //Notation AGE
                            //#######################
                            const baremeNoteAge = [[5, -1], [4, 22], [3, 25], [2, 28], [1, 35], [0, 45]];
                            let notebetdsl5 = 0;
                            let notebetSl5 = 0;
                            let notebetaal5 = 0;
                            let notebetTj5 = 0;
                            let notebetdsl15 = 0;
                            let notebetSl15 = 0;
                            let notebetaal15 = 0;
                            let notebetTj15 = 0;
                            let notebetAge = 0;
                            for (let l = 0; l < 11; l++) {
                                if (sdsl5 > baremeNoteSadx[l][1]) {
                                    notebetdsl5 = baremeNoteSadx[l][0];
                                    //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetdsl5'),(notebetdsl5));
                                }
                                ;
                                if (sl5 > baremeNoteSlx[l][1]) {
                                    notebetSl5 = baremeNoteSlx[l][0];
                                    //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetSl5'),(notebetSl5));
                                }
                                ;
                                if (saal5 > baremeNoteSadx[l][1]) {
                                    notebetaal5 = baremeNoteSadx[l][0];
                                    //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetaal5'),(notebetaal5));
                                }
                                ;
                                if (tj5 > baremeNoteTjx[l][1]) {
                                    notebetTj5 = baremeNoteTjx[l][0];
                                    //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetTj5'),(notebetTj5));
                                }
                                ;
                                if (sdsl15 > baremeNoteSadx[l][1]) {
                                    notebetdsl15 = baremeNoteSadx[l][0];
                                    //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetdsl15'),(notebetdsl15));
                                }
                                ;
                                if (sl15 > baremeNoteSlx[l][1]) {
                                    notebetSl15 = baremeNoteSlx[l][0];
                                    //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetSl15'),(notebetSl15));
                                }
                                ;
                                if (saal15 > baremeNoteSadx[l][1]) {
                                    notebetaal15 = baremeNoteSadx[l][0];
                                    //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetaal15'),(notebetaal15));
                                }
                                ;
                                if (tj15 > baremeNoteTjx[l][1]) {
                                    notebetTj15 = baremeNoteTjx[l][0];
                                    //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetTj15'),(notebetTj15));
                                }
                                ;
                            }
                            ;
                            for (let m = 0; m < 6; m++) {
                                if (age > baremeNoteAge[m][1]) {
                                    notebetAge = baremeNoteAge[m][0];
                                    //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/notebetAge'),(notebetAge));
                                }
                                ;
                            }
                            ;
                            let noteBetSorare = Math.round((+notebetTj5 + notebetdsl5 + notebetTj15 + notebetdsl15 + notebetaal15 + notebetSl5 + notebetSl15 + notebetAge + notebetaal5) * 2.22);
                            //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/noteBetSorare'),(noteBetSorare));
                            console.log(count, "etape4");
                            let tabSlugCardRare = [];
                            let tabSlugCardLimited = [];
                            let tabSlugCardSuperRare = [];
                            let tabSlugCardUnique = [];
                            let nbArrayRare = 0;
                            let nbArrayLimited = 0;
                            let nbArraySuperRare = 0;
                            let nbArrayUnique = 0;
                            let nbSeason = Object.keys(get_player.cardSupply).length;
                            let nbCardsRare = 0;
                            let nbCardsLimited = 0;
                            let nbCardsSuperRare = 0;
                            let nbCardsUnique = 0;
                            let season = 0;
                            let tabCardsRare = [];
                            let tabCardsSuperRare = [];
                            let tabCardsUnique = [];
                            let tabCardsLimited = [];
                            let tabCardsRareTOTAL = [];
                            let tabCardsSuperRareTOTAL = [];
                            let tabCardsUniqueTOTAL = [];
                            let tabCardsLimitedTOTAL = [];
                            let result = [];
                            let tabPriceRare = [];
                            let tabPriceSuperRare = [];
                            let tabPriceUnique = [];
                            let tabPriceLimited = [];
                            let bestpriceRare = 0;
                            let bestpriceSuperRare = 0;
                            let bestpriceUnique = 0;
                            let bestpriceLimited = 0;
                            let priceLimited = 0;
                            let priceUnique = 0;
                            let priceSuperRare = 0;
                            let priceRare = 0;
                            for (let f = 0; f < nbSeason; f++) {
                                nbCardsRare = get_player.cardSupply[f].rare;
                                nbCardsLimited = get_player.cardSupply[f].limited;
                                nbCardsSuperRare = get_player.cardSupply[f].superRare;
                                nbCardsUnique = get_player.cardSupply[f].unique;
                                season = get_player.cardSupply[f].season.startYear;
                                if (nbCardsRare != 0) {
                                    for (let h = 0; h < nbCardsRare; h++) {
                                        tabSlugCardRare.push(playerslug + "-" + season + "-rare-" + (+h + 1));
                                        nbArrayRare = Math.ceil(tabSlugCardRare.length / 100);
                                    }
                                    ;
                                }
                                if (nbCardsLimited != 0) {
                                    for (let h = 0; h < nbCardsLimited; h++) {
                                        tabSlugCardLimited.push(playerslug + "-" + season + "-limited-" + (+h + 1));
                                        nbArrayLimited = Math.ceil(tabSlugCardLimited.length / 100);
                                    }
                                    ;
                                }
                                if (nbCardsSuperRare != 0) {
                                    for (let h = 0; h < nbCardsSuperRare; h++) {
                                        tabSlugCardSuperRare.push(playerslug + "-" + season + "-super_rare-" + (+h + 1));
                                        nbArraySuperRare = Math.ceil(tabSlugCardSuperRare.length / 100);
                                    }
                                    ;
                                }
                                if (nbCardsUnique != 0) {
                                    for (let h = 0; h < nbCardsUnique; h++) {
                                        tabSlugCardUnique.push(playerslug + "-" + season + "-unique-" + (+h + 1));
                                        nbArrayUnique = Math.ceil(tabSlugCardUnique.length / 100);
                                    }
                                    ;
                                }
                            }
                            ;
                            console.log("etape5");
                            // console.log(nbArrayRare);
                            // ######## RECHERCHE PRIX RARE ########
                            if (nbArrayRare != 0 && nbArrayRare != null && nbArrayRare != undefined) {
                                let slugsRare = [];
                                for (let k = 0; k < nbArrayRare; k++) {
                                    slugsRare = tabSlugCardRare.slice(0 + (k * 100), 100 + (k * 100));
                                    const variables = { slugs: slugsRare };
                                    const cardsRareData = yield graphQLClient.request(GET_PRICE, variables);
                                    const getCardsrare = cardsRareData.cards;
                                    tabCardsRare.push([getCardsrare.flat(Infinity)]);
                                    tabCardsRareTOTAL = tabCardsRare.flat(Infinity);
                                    result = tabCardsRareTOTAL.filter(tabCardsRareTOTAL => tabCardsRareTOTAL.onSale === true);
                                    if (result != null) {
                                        global.cardsOnSaleRare = result;
                                        for (let i = 0; i < result.length; i++) {
                                            if (result[i].pictureUrl != undefined) {
                                                global.cardpicturerare = result[i].pictureUrl;
                                            }
                                        }
                                    }
                                    ;
                                    for (let n = 0; n < result.length; n++) {
                                        if ((result[n].liveSingleSaleOffer != null)) {
                                            tabPriceRare.push([result[n].liveSingleSaleOffer.price]);
                                        }
                                        bestpriceRare = Math.min(...(tabPriceRare.flat(Infinity))) / Math.pow(10, 18);
                                    }
                                    if (bestpriceRare === Infinity || bestpriceRare === 0) {
                                        priceRare = 0;
                                        global.onSaleRare = "false";
                                    }
                                    else {
                                        priceRare = bestpriceRare;
                                        global.onSaleRare = "true";
                                    }
                                    ;
                                }
                            }
                            else {
                                global.onSaleRare = "false";
                                global.cardpicturerare = "";
                                global.cardsOnSaleRare = [];
                            }
                            // ######## RECHERCHE PRIX LIMITED ########
                            if (nbArrayLimited != 0 && nbArrayLimited != null && nbArrayLimited != undefined) {
                                let slugsLimited = [];
                                for (let k = 0; k < nbArrayLimited; k++) {
                                    slugsLimited = tabSlugCardLimited.slice(0 + (k * 100), 100 + (k * 100));
                                    const variables = { slugs: slugsLimited };
                                    const cardsLimitedData = yield graphQLClient.request(GET_PRICE, variables);
                                    const getCardsLimited = cardsLimitedData.cards;
                                    tabCardsLimited.push([getCardsLimited.flat(Infinity)]);
                                    tabCardsLimitedTOTAL = tabCardsLimited.flat(Infinity);
                                    result = tabCardsLimitedTOTAL.filter(tabCardsLimitedTOTAL => tabCardsLimitedTOTAL.onSale === true);
                                    if (result != null) {
                                        //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardsOnSaleLimited'),(result));
                                        global.cardsOnSaleLimited = result;
                                        // //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardpicturelimited'),(result[0].pictureUrl));
                                        for (let i = 0; i < result.length; i++) {
                                            if (result[i].pictureUrl != undefined) {
                                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardpicturelimited'),(result[i].pictureUrl));
                                                global.cardpicturelimited = result[i].pictureUrl;
                                            }
                                        }
                                    }
                                    ;
                                    console.log(count, "etape6");
                                    for (let n = 0; n < result.length; n++) {
                                        if ((result[n].liveSingleSaleOffer != null)) {
                                            tabPriceLimited.push([result[n].liveSingleSaleOffer.price]);
                                        }
                                        bestpriceLimited = Math.min(...(tabPriceLimited.flat(Infinity))) / Math.pow(10, 18);
                                    }
                                    if (bestpriceLimited === Infinity || bestpriceLimited === 0) {
                                        priceLimited = 0;
                                        global.onSaleLimited = "false";
                                    }
                                    else {
                                        priceLimited = bestpriceLimited;
                                        global.onSaleLimited = "true";
                                    }
                                    ;
                                }
                                ;
                            }
                            else {
                                global.onSaleLimited = "false";
                                global.cardpicturelimited = "";
                                global.cardsOnSaleLimited = [];
                            }
                            console.log(count, "etape6");
                            // ######## RECHERCHE PRIX SUPER RARE ########
                            if (nbArraySuperRare != 0 && nbArraySuperRare != null && nbArraySuperRare != undefined) {
                                let slugsSuperRare = [];
                                for (let k = 0; k < nbArraySuperRare; k++) {
                                    slugsSuperRare = tabSlugCardSuperRare.slice(0 + (k * 100), 100 + (k * 100));
                                    const variables = { slugs: slugsSuperRare };
                                    const cardsSuperRareData = yield graphQLClient.request(GET_PRICE, variables);
                                    const getCardsSuperRare = cardsSuperRareData.cards;
                                    tabCardsSuperRare.push([getCardsSuperRare.flat(Infinity)]);
                                    tabCardsSuperRareTOTAL = tabCardsSuperRare.flat(Infinity);
                                    result = tabCardsSuperRareTOTAL.filter(tabCardsSuperRareTOTAL => tabCardsSuperRareTOTAL.onSale === true);
                                    if (result != null) {
                                        //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardsOnSaleSuperRare'),(result));
                                        global.cardsOnSaleSuperRare = result;
                                        // //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardpictureSuperRare'),(result[0].pictureUrl));
                                        for (let i = 0; i < result.length; i++) {
                                            if (result[i].pictureUrl != undefined) {
                                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardpictureSuperRare'),(result[i].pictureUrl));
                                                global.cardpictureSuperRare = result[i].pictureUrl;
                                            }
                                        }
                                    }
                                    for (let n = 0; n < result.length; n++) {
                                        if ((result[n].liveSingleSaleOffer != null)) {
                                            tabPriceSuperRare.push([result[n].liveSingleSaleOffer.price]);
                                        }
                                        bestpriceSuperRare = Math.min(...(tabPriceSuperRare.flat(Infinity))) / Math.pow(10, 18);
                                    }
                                    console.log(bestpriceSuperRare);
                                    if (bestpriceSuperRare === Infinity || bestpriceSuperRare === 0) {
                                        priceSuperRare = 0;
                                        global.onSaleSuperRare = "false";
                                    }
                                    else {
                                        priceSuperRare = bestpriceSuperRare;
                                        global.onSaleSuperRare = "true";
                                    }
                                    ;
                                }
                                ;
                            }
                            else {
                                global.onSaleSuperRare = "false";
                                global.cardpictureSuperRare = "";
                                global.cardsOnSaleSuperRare = [];
                            }
                            console.log(count, "etape7");
                            // ######## RECHERCHE PRIX UNIQUE ########
                            if (nbArrayUnique != 0 && nbArrayUnique != null && nbArrayUnique != undefined) {
                                let slugsUnique = [];
                                for (let k = 0; k < nbArrayUnique; k++) {
                                    slugsUnique = tabSlugCardUnique.slice(0 + (k * 100), 100 + (k * 100));
                                    const variables = { slugs: slugsUnique };
                                    const cardsUniqueData = yield graphQLClient.request(GET_PRICE, variables);
                                    const getCardsUnique = cardsUniqueData.cards;
                                    tabCardsUnique.push([getCardsUnique.flat(Infinity)]);
                                    tabCardsUniqueTOTAL = tabCardsUnique.flat(Infinity);
                                    result = tabCardsUniqueTOTAL.filter(tabCardsUniqueTOTAL => tabCardsUniqueTOTAL.onSale === true);
                                    if (result != null) {
                                        //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardsOnSaleUnique'),(result));
                                        global.cardsOnSaleUnique = result;
                                        // //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardpictureUnique'),(result[0].pictureUrl));
                                        for (let i = 0; i < result.length; i++) {
                                            if (result[i].pictureUrl != undefined) {
                                                //set(ref(getDatabase(),'/test/clubsReady/' +count+ '/cardpictureUnique'),(result[i].pictureUrl));
                                                global.cardpictureUnique = result[i].pictureUrl;
                                            }
                                        }
                                    }
                                    for (let n = 0; n < result.length; n++) {
                                        if ((result[n].liveSingleSaleOffer != null)) {
                                            tabPriceUnique.push([result[n].liveSingleSaleOffer.price]);
                                        }
                                        bestpriceUnique = Math.min(...(tabPriceUnique.flat(Infinity))) / Math.pow(10, 18);
                                    }
                                    if (bestpriceUnique === Infinity || bestpriceUnique === 0) {
                                        priceUnique = 0;
                                        global.onSaleUnique = "false";
                                    }
                                    else {
                                        priceUnique = bestpriceUnique;
                                        global.onSaleUnique = "true";
                                    }
                                    ;
                                }
                                ;
                            }
                            else {
                                global.onSaleUnique = "false";
                                global.cardpictureUnique = "";
                                global.cardsOnSaleUnique = [];
                            }
                            console.log(count, "etape8");
                            variables = { slug: playerslug, };
                            const liste_resultats = yield graphQLClient.request(GET_RESULTATS, variables);
                            if (position === "Goalkeeper") {
                                const getCardsPictureCommon = yield graphQLClient.request(GET_CARD_COMMON, variables);
                                if (getCardsPictureCommon.player.cardSampleUrl !== null) {
                                    global.cardpicturecommon = getCardsPictureCommon.player.cardSampleUrl;
                                    //set(ref(getDatabase(),'/test/clubsReady/' +count+  '/cardpicturecommon'),(global.cardpicturecommon))
                                    ;
                                }
                                else {
                                    global.cardpicturecommon = "";
                                }
                            }
                            else {
                                global.cardpicturecommon = "false";
                            }
                            ;
                            global.minsPlayed = [];
                            global.score = [];
                            for (let i = 0; i < 15; i++) {
                                if (liste_resultats.player.gameStats && liste_resultats.player.gameStats[i] && liste_resultats.player.gameStats[i].minsPlayed !== null) {
                                    //set(ref(getDatabase(),'/test/clubsReady/' +count+  '/minsPlayed/'+i),(liste_resultats.player.gameStats[i].minsPlayed));
                                    global.minsPlayed.push(liste_resultats.player.gameStats[i].minsPlayed);
                                }
                                else {
                                    //set(ref(getDatabase(),'/test/clubsReady/' +count+  '/minsPlayed/'+i),(0));
                                    global.minsPlayed.push(0);
                                }
                                if (liste_resultats.player.allSo5Scores && liste_resultats.player.allSo5Scores.nodes[i] && liste_resultats.player.allSo5Scores.nodes[i].score !== null) {
                                    //set(ref(getDatabase(),'/test/clubsReady/' +count+  '/score/'+i),(liste_resultats.player.allSo5Scores.nodes[i].score)); 
                                    global.score.push(liste_resultats.player.allSo5Scores.nodes[i].score);
                                }
                                else {
                                    //set(ref(getDatabase(),'/test/clubsReady/' +count+  '/score/'+i),(0)); 
                                    global.score.push(0);
                                }
                            }
                            ;
                            console.log(count, "etape9");
                            if (priceLimited != null && sl5 != null && priceLimited != 0) {
                                global.ratioLimited = Math.round(sl5 / priceLimited);
                            }
                            else {
                                global.ratioLimited = 0;
                            }
                            ;
                            if (priceRare != null && sl5 != null && priceRare != 0) {
                                global.ratioRare = Math.round(sl5 / priceRare);
                            }
                            else {
                                global.ratioRare = 0;
                            }
                            if (priceSuperRare != null && sl5 != null && priceSuperRare != 0) {
                                global.ratioSuperRare = Math.round(sl5 / priceSuperRare);
                            }
                            else {
                                global.ratioSuperRare = 0;
                            }
                            if (priceUnique != null && sl5 != null && priceUnique != 0) {
                                global.ratioUnique = Math.round(sl5 / priceUnique);
                            }
                            else {
                                global.ratioUnique = 0;
                            }
                            console.log(count, "etape10");
                            console.log(count, playerslug, "limited: " + priceLimited, "rare: " + priceRare, "superRare: " + priceSuperRare, "unique: " + priceUnique);
                            console.log(count, playerslug, "limited: " + global.onSaleLimited, "rare: " + global.onSaleRare, "superRare: " + global.onSaleSuperRare, "unique: " + global.onSaleUnique);
                            const priceRef = (0, firestore_1.collection)(db, "price", playerslug, Date());
                            yield (0, firestore_2.setDoc)((0, firestore_2.doc)(priceRef), {
                                priceLimited: priceLimited,
                                priceSuperRare: priceSuperRare,
                                priceUnique: priceUnique,
                                priceRare: priceRare,
                                Maj: Date()
                            });
                            const playerRef = (0, firestore_1.collection)(db, "players", global.competition, position);
                            yield (0, firestore_2.setDoc)((0, firestore_2.doc)(playerRef, playerslug), {
                                Maj: Date(),
                                age: age,
                                cardpicturelimited: global.cardpicturelimited,
                                cardpicturerare: global.cardpicturerare,
                                cardpicturecommon: global.cardpicturecommon,
                                cardsOnSaleLimited: global.cardsOnSaleLimited,
                                cardsOnSaleRare: global.cardsOnSaleRare,
                                competition: global.competition,
                                leagueslug: global.leagueslug,
                                minsPlayed: global.minsPlayed,
                                nationalteamPicture: global.nationalteamPicture,
                                nationalteamname: global.nationalteamname,
                                noteBetSorare: noteBetSorare,
                                notebetAge: notebetAge,
                                notebetSl15: notebetSl15,
                                notebetSl5: notebetSl5,
                                notebetTj5: notebetTj5,
                                notebetaal5: notebetaal5,
                                notebetaal15: notebetaal15,
                                notebetdsl15: notebetdsl15,
                                onSaleLimited: global.onSaleLimited,
                                onSaleRare: global.onSaleRare,
                                onSaleUnique: global.onSaleUnique,
                                onSaleSuperRare: global.onSaleSuperRare,
                                playername: playername,
                                playerpictureURL: global.playerpictureURL,
                                playerslug: playerslug,
                                position: position,
                                priceLimited: priceLimited,
                                priceSuperRare: priceSuperRare,
                                priceUnique: priceUnique,
                                priceRare: priceRare,
                                saal15: saal15,
                                saal5: saal5,
                                score: global.score,
                                sdsl15: sdsl15,
                                sdsl5: sdsl5,
                                sl5: sl5,
                                sl15: sl15,
                                status: global.statut,
                                teamleague: global.teamleague,
                                teamname: global.teamname,
                                teampictureURL: global.teampictureURL,
                                teamslug: global.teamslug,
                                tj5: tj5,
                                tj15: tj15,
                                ratioRare: global.ratioRare,
                                ratioLimited: global.ratioLimited,
                                ratioSuperRare: global.ratioSuperRare,
                                ratioUnique: global.ratioUnique,
                                // allSo5Scores:global.allSo5Scores
                            });
                            console.log("joueur n??: " + (count) + " " + playername + " import??!");
                        }
                        else {
                            console.log("joueur n??: " + (count + 1) + " " + playername + " non import??!");
                        }
                    }
                    catch (error) {
                        while (+count < (+nbPlayersLicense - 1))
                            ;
                    }
                } while (+count < (+nbPlayersLicense - 1));
            });
        }
        console.log("Tous les joueurs ont ??t?? import??!" + Date());
        main().catch((error) => console.error(error));
    });
});
myJob1.start();
app1.use('/', router);
app1.listen(port);
// ########################################################
// ########################################################
// ########################################################
// ########################################################
// ########################################################
// ########################################################
// ########################################################
// ########################################################
// ########################################################
// ########################################################
// ########################################################
// ########################################################
// ########################################################
// ########################################################
// ########################################################
router.get('/api/refreshlast', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, firestore_1.getFirestore)();
    const dbRef = (0, database_1.ref)((0, database_1.getDatabase)());
    var tabUsers = [];
    const querySnapshot = yield (0, firestore_1.getDocs)((0, firestore_1.collection)(db, "users"));
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        tabUsers.push(doc.data());
    });
    const nbUsers = tabUsers.length;
    let count = -1;
    do {
        count += 1;
        const user_token = tabUsers[count].token;
        const user = tabUsers[count].user;
        const endpoint = 'https://api.sorare.com/graphql';
        const graphQLClient = new graphql_request_1.GraphQLClient(endpoint, {
            headers: {
                Authorization: 'Bearer ' + user_token + '',
                'content-type': 'application/json'
            },
        });
        const GET_PROFIL_CURRENT_USER = (0, graphql_request_1.gql) `
        query current_user{
          currentUser{
            nickname
            createdAt
            allTimeBestDecksInFormation{
              pictureUrl
            }
            totalBalance
            cardCounts{
              limited
              rare
              superRare
              unique
            }
            profile{
              clubName
              pictureUrl
              proSince
              slug
              discordUsername
              clubBanner{
                pictureUrl
              }
            }
          }
        }
        `;
        const GET_DIRECT_OFFER_RECEIVE_CURRENT_USER = (0, graphql_request_1.gql) `
        query direct_offer($slug:String){
          currentUser{
            directOffers(direction:RECEIVED,first:50,after: $slug){
              pageInfo {
                  hasNextPage
                  hasPreviousPage
                  endCursor
                }  
              totalCount
              nodes{
                aasmState
                id
                creditCardFee
                acceptedAt
                sendWeiAmount
                receiveWeiAmount
                sendCardOffers{
                    id
                  card{
                    rarity
                    age
                    slug
                    name
                    pictureUrl
                    player{
                      displayName
                      slug
                      position
                      age
                      activeClub{
                        pictureUrl
                        slug
                        name
                          domesticLeague{
                          slug
                        }
                      }
                    }
                  }
                }
                receiveCardOffers{
                  id
                  card{
                    rarity
                    age
                    slug
                    name
                    pictureUrl
                    player{
                      displayName
                      slug
                      position
                      age
                      activeClub{
                        pictureUrl
                        slug
                        name
                          domesticLeague{
                          slug
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }        `;
        const GET_DIRECT_OFFER_SENT_CURRENT_USER = (0, graphql_request_1.gql) `
        query direct_offer($slug:String){
          currentUser{
            directOffers(direction:SENT,first:50,after: $slug){
              pageInfo {
                hasNextPage
                hasPreviousPage
                endCursor
              }  
              totalCount
              nodes{
                aasmState
                id
                creditCardFee
                acceptedAt
                sendWeiAmount
                receiveWeiAmount
                sendCardOffers{
                    id
                  card{
                    rarity
                    age
                    slug
                    name
                    pictureUrl
                    player{
                      displayName
                      slug
                      position
                      age
                      activeClub{
                        pictureUrl
                        slug
                        name
                          domesticLeague{
                          slug
                        }
                      }
                    }
                  }
                }
                receiveCardOffers{
                  id
                  card{
                    rarity
                    age
                    slug
                    name
                    pictureUrl
                    player{
                      displayName
                      slug
                      position
                      age
                      activeClub{
                        pictureUrl
                        slug
                        name
                          domesticLeague{
                          slug
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        `;
        const GET_CARDS_CURRENT_USER = (0, graphql_request_1.gql) `
      query current_user($slug:String){
        currentUser{
          paginatedCards(first:50,after: $slug){
            pageInfo {
              hasNextPage
              hasPreviousPage
              endCursor
            }
              nodes{
                rarity
                player{
                  position
                  slug
                  displayName
                  age
                  activeClub{
                    pictureUrl
                    name
                    slug
                    domesticLeague{
                      slug
                    }
                  }
                }
                grade
                onSale
                ownerSince
                xp
                owner{
                  from
                  price
                  transferType
                }
                name
                slug
                pictureUrl
              }
            }
          }
        }
      `;
        const GET_AUCTIONS_CURRENT_USER = (0, graphql_request_1.gql) `
      query current_user($slug:String){
        currentUser{
          wonEnglishAuctions(sortByEndDate:DESC,first:50,after:$slug){
            totalCount
           pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
            }
            nodes{
              id
              name
              currentPrice
              creditCardFee
              endDate
              cards{
                rarity
                pictureUrl
                slug
                player{
                  displayName
                  slug
                  position
                  age
                  activeClub{
                    pictureUrl
                    slug
                    name
                    domesticLeague{
                      slug
                    }
                  }
                }
              }
            }
           }    
        }
      }
      `;
        const GET_REWARDS_CURRENT_USER = (0, graphql_request_1.gql) `
      query current_user($slug:String){
        currentUser{
          createdAt
         accountEntries(sortType:ASC,after:$slug){
            pageInfo {
              hasNextPage
              hasPreviousPage
              endCursor
            }
          nodes{
            date
            amount
            operation{
              __typename
            }
          }
        }
      }
    }
    `;
        const profil = yield graphQLClient.request(GET_PROFIL_CURRENT_USER);
        const myProfil = profil.currentUser;
        console.log(myProfil);
        console.log("date: ", myProfil.createdAt);
        global.dateCreation = new Date(myProfil.createdAt);
        console.log("dateCreation: ", global.dateCreation);
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/token'), (user_token));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/nickname'), (myProfil.nickname));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/totalBalance'), (myProfil.totalBalance / Math.pow(10, 18)));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/createdAt'), (myProfil.createdAt));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/clubName'), (myProfil.profile.clubName));
        (0, database_1.onValue)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/'), (snapshot) => {
            const profil = snapshot.val();
            if (profil.points != undefined) {
                const points = profil.points;
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/points'), (points));
            }
            else {
                const points = 300;
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/points'), (points));
            }
        }, { onlyOnce: true });
        if (myProfil.profile.pictureUrl === "") {
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/pictureUrl'), ("https://firebasestorage.googleapis.com/v0/b/betsorare.appspot.com/o/avatar-unknow.png?alt=media&token=8b97f8a9-3c6b-4c46-b0f7-e9b31317d83b"));
        }
        else {
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/pictureUrl'), (myProfil.profile.pictureUrl));
        }
        if (myProfil.allTimeBestDecksInFormation[0] != null) {
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/BestDeck'), (myProfil.allTimeBestDecksInFormation[0]));
        }
        const users = (0, firestore_1.collection)(db, "users");
        yield (0, firestore_2.setDoc)((0, firestore_2.doc)(users, user), {
            Maj: Date(),
            user: user,
            token: user_token,
        });
        const dbRef = (0, database_1.ref)((0, database_1.getDatabase)());
        const nbRarityCards = myProfil.cardCounts;
        var tabBalanceSent = [0];
        var tabBalanceReceived = [0];
        var tabAllValue = [0];
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/'), (""));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction'), (""));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers'), (""));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/nombreCards'), (nbRarityCards));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/totalWallet'), (myProfil.totalBalance / Math.pow(10, 18)));
        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/lastRefresh'), (Date()));
        const reducer = (previousValue, currentValue) => previousValue + currentValue;
        // #####################################
        // REWARDS############
        setTimeout(function () {
            return __awaiter(this, void 0, void 0, function* () {
                var allMyRewards = [];
                var myRewards = [];
                var tabRewards = [];
                global.rewards = false;
                global.nextPage = "";
                let variables;
                do {
                    let slug = global.nextPage;
                    variables = {
                        slug: slug,
                    };
                    const accountEntries = yield graphQLClient.request(GET_REWARDS_CURRENT_USER, variables);
                    const userDataCards = accountEntries.currentUser.accountEntries.nodes;
                    global.userRewardsNextPage = accountEntries.currentUser.accountEntries.pageInfo.hasNextPage;
                    const userRewardsEndCursor = accountEntries.currentUser.accountEntries.pageInfo.endCursor;
                    global.nextPage = userRewardsEndCursor;
                    const nbEntries = accountEntries.currentUser.accountEntries.nodes.length;
                    for (let i = 0; i < nbEntries; i++) {
                        if (accountEntries.currentUser.accountEntries.nodes[i].operation != null && accountEntries.currentUser.accountEntries.nodes[i].operation["__typename"] === "So5Reward") {
                            global.rewards = true;
                            myRewards.push(accountEntries.currentUser.accountEntries.nodes[i]);
                            const rewardAmount = accountEntries.currentUser.accountEntries.nodes[i].amount;
                            tabRewards.push(+rewardAmount);
                        }
                    }
                } while (global.userRewardsNextPage === true);
                if (global.rewards === true) {
                    const totalRewards = (tabRewards.reduce(reducer).toFixed(3)) / Math.pow(10, 18);
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/totalRewards'), (+totalRewards));
                    console.log("totalRewards: ", totalRewards);
                }
                else {
                    const totalRewards = 0;
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/totalRewards'), (+totalRewards));
                    console.log("totalRewards: ", totalRewards);
                }
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myrewards/'), (myRewards));
            });
        }, 30000);
        // #####################################
        // paginatedCards(first:300)############
        setTimeout(function () {
            return __awaiter(this, void 0, void 0, function* () {
                var allMyCards = [];
                var myCards = [];
                global.nextPage = "";
                do {
                    let variables;
                    let slug = global.nextPage;
                    variables = {
                        slug: slug,
                    };
                    const userData = yield graphQLClient.request(GET_CARDS_CURRENT_USER, variables);
                    const userDataCards = userData.currentUser.paginatedCards.nodes;
                    global.userDataNextPage = userData.currentUser.paginatedCards.pageInfo.hasNextPage;
                    const userDataEndCursor = userData.currentUser.paginatedCards.pageInfo.endCursor;
                    global.nextPage = userDataEndCursor;
                    const nbCards = userData.currentUser.paginatedCards.nodes.length;
                    for (let i = 0; i < nbCards; i++) {
                        myCards.push(userData.currentUser.paginatedCards.nodes[i]);
                    }
                } while (global.userDataNextPage === true);
                // const allCards = await graphQLClient.request(GET_CARDS_CURRENT_USER);
                // const myCards=allCards.currentUser.paginatedCards.nodes;
                console.log("nombre de cartes: ", myCards.length);
                const nbCards = myCards.length;
                (0, database_1.get)((0, database_1.child)(dbRef, user + '/mycards/lockedprice')).then((snapshot) => {
                    if (snapshot.exists()) {
                        const myCardsLock = snapshot.val();
                        global.cardsLockArray = [];
                        for (let i = 0; i < myCardsLock.length; i++) {
                            global.cardsLockArray.push(myCardsLock[i].cardSlug, myCardsLock[i].priceLocked);
                        }
                    }
                    else {
                    }
                }).catch((error) => {
                    console.error(error);
                });
                for (let i = 0; i < nbCards; i++) {
                    if (myCards[i].rarity != "common") {
                        allMyCards.push(myCards[i]);
                    }
                }
                const nbCardqRarity = allMyCards.length;
                console.log("nombre carte raret??: ", nbCardqRarity);
                for (let i = 0; i < nbCardqRarity; i++) {
                    const playername = allMyCards[i].player.displayName;
                    const age = allMyCards[i].player.age;
                    const position = allMyCards[i].player.position;
                    const dateAchat = allMyCards[i].ownerSince;
                    const playerslug = allMyCards[i].player.slug;
                    const Url = allMyCards[i].pictureUrl;
                    const rarity = allMyCards[i].rarity;
                    global.cardslug = allMyCards[i].slug;
                    const getOnSale = allMyCards[i].onSale;
                    const grade = allMyCards[i].grade;
                    const xp = allMyCards[i].xp;
                    const transferType = allMyCards[i].owner.transferType;
                    global.priceAchat = (allMyCards[i].owner.price) / Math.pow(10, 18);
                    global.lock = "lock_open";
                    if (allMyCards[i].player.activeClub != null) {
                        if (allMyCards[i].player.activeClub.domesticLeague != null) {
                            global.leagueslug = allMyCards[i].player.activeClub.domesticLeague.slug;
                        }
                        else {
                            global.leagueslug = "other";
                        }
                        ;
                    }
                    else {
                        global.leagueslug = "other";
                    }
                    ;
                    if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                        global.competition = "champion-europe";
                    }
                    else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leagueslug === "ukrainian-premier-league") {
                        global.competition = "challenger-europe";
                    }
                    else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                        global.competition = "champion-asia";
                    }
                    else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                        global.competition = "champion-america";
                    }
                    else {
                        global.competition = "other";
                    }
                    ;
                    if (allMyCards[i].player.activeClub != null) {
                        global.team = allMyCards[i].player.activeClub.name;
                        global.teamUrl = allMyCards[i].player.activeClub.pictureUrl;
                    }
                    else {
                        global.teamUrl = "";
                        global.team = "";
                    }
                    const docRef = (0, firestore_2.doc)((0, firestore_1.getFirestore)(), "players", global.competition, position, playerslug);
                    const docSnap = yield (0, firestore_1.getDoc)(docRef);
                    if (docSnap.exists()) {
                        global.noteSorareManger = docSnap.data().noteBetSorare;
                        if (rarity === "limited") {
                            global.lastValue = docSnap.data().priceLimited, global.onSale = docSnap.data().onSaleLimited;
                        }
                        else if (rarity === "rare") {
                            global.lastValue = docSnap.data().priceRare, global.onSale = docSnap.data().onSaleRare;
                        }
                    }
                    else {
                        global.lastValue = 0;
                    }
                    ;
                    tabAllValue.push(global.lastValue);
                    if (global.cardsLockArray != undefined && global.cardsLockArray.includes(global.cardslug)) {
                        global.cardsLockArray.indexOf(global.cardslug);
                        const findIndex = global.cardsLockArray.indexOf(global.cardslug) + 1;
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/locked'), ("lock"));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/priceAchat'), (global.cardsLockArray[findIndex]));
                    }
                    else {
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/locked'), (global.lock));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/priceAchat'), (global.priceAchat));
                    }
                    ;
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/playername'), (playername));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/age'), (age));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/position'), (position));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/dateAchat'), (dateAchat));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/Url'), (Url));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/rarete'), (rarity));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/cardslug'), (global.cardslug));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/onSale'), (getOnSale));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/grade'), (grade));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/xp'), (xp));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/playerslug'), (playerslug));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/transferType'), (transferType));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/league'), (global.leagueslug));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/competition'), (global.competition));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/lastValue'), (global.lastValue));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/onSale'), (global.onSale));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/rentapotent'), (global.lastValue - global.priceAchat));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/teamUrl'), (global.teamUrl));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/team'), (global.team));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/noteSorareManger'), (global.noteSorareManger));
                    if (global.priceAchat != 0) {
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/rentapotentPercent'), (((global.lastValue - global.priceAchat)) / global.priceAchat) * 100);
                    }
                    else {
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mycards/card/' + i + '/rentapotentPercent'), (100));
                    }
                }
                const allValue = tabAllValue.reduce(reducer).toFixed(3);
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/totalValueWallet'), (+allValue));
            });
        }, 30000);
        // ##############################
        // wonEnglishAuctions############
        setTimeout(function () {
            return __awaiter(this, void 0, void 0, function* () {
                var tabAllAuctions = [0];
                var userAuctions = [];
                global.auctions = false;
                global.nextPage = "";
                do {
                    let variables;
                    let slug = global.nextPage;
                    variables = {
                        slug: slug,
                    };
                    const auctions = yield graphQLClient.request(GET_AUCTIONS_CURRENT_USER, variables);
                    const usetabAuctions = auctions.currentUser.wonEnglishAuctions.nodes;
                    global.userAuctionsNextPage = auctions.currentUser.wonEnglishAuctions.pageInfo.hasNextPage;
                    const userAuctionsEndCursor = auctions.currentUser.wonEnglishAuctions.pageInfo.endCursor;
                    global.nextPage = userAuctionsEndCursor;
                    const nbAuctions = auctions.currentUser.wonEnglishAuctions.nodes.length;
                    for (let i = 0; i < nbAuctions; i++) {
                        if (auctions.currentUser.wonEnglishAuctions.nodes[i] != null && auctions.currentUser.wonEnglishAuctions.nodes[i] != undefined) {
                            global.auctions = true;
                            userAuctions.push(auctions.currentUser.wonEnglishAuctions.nodes[i]);
                        }
                    }
                } while (global.userAuctionsNextPage === true);
                const nbAuctions = userAuctions.length;
                if (global.auctions === true) {
                    const nbAuctions = userAuctions.length;
                    for (let i = 0; i < nbAuctions; i++) {
                        const auctionsCard = userAuctions[i].cards[0];
                        const nbCardsAuction = userAuctions[i].cards.length;
                        const cardName = userAuctions[i].name;
                        const currentPrice = userAuctions[i].currentPrice / Math.pow(10, 18);
                        tabAllAuctions.push(userAuctions[i].currentPrice / Math.pow(10, 18));
                        const creditCardFee = userAuctions[i].creditCardFee;
                        const endDate = userAuctions[i].endDate;
                        const id = userAuctions[i].id;
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/cardName'), (cardName));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/currentPrice'), (currentPrice));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/endDate'), (endDate));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/id'), (id));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/creditCardFee'), (creditCardFee));
                        for (let g = 0; g < nbCardsAuction; g++) {
                            const cardSlug = userAuctions[i].cards[g].slug;
                            const rarete = userAuctions[i].cards[g].rarity;
                            const cardPicture = userAuctions[i].cards[g].pictureUrl;
                            const playerSlug = userAuctions[i].cards[g].player.slug;
                            const playerName = userAuctions[i].cards[g].player.displayName;
                            const position = userAuctions[i].cards[g].player.position;
                            const age = userAuctions[i].cards[g].player.age;
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/cardSlug'), (cardSlug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/cardPicture'), (cardPicture));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/playerSlug'), (playerSlug));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/playerName'), (playerName));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/position'), (position));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/rarete'), (rarete));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/auctionCards/' + g + '/age'), (age));
                        }
                        const cardSlug = auctionsCard.slug;
                        const rarete = auctionsCard.rarity;
                        const cardPicture = auctionsCard.pictureUrl;
                        const playerSlug = auctionsCard.player.slug;
                        const playerName = auctionsCard.player.displayName;
                        const position = auctionsCard.player.position;
                        const age = auctionsCard.player.age;
                        if (auctionsCard.player.activeClub != null) {
                            global.leagueslug = auctionsCard.player.activeClub.domesticLeague.slug;
                        }
                        else {
                            global.leagueslug = "other";
                        }
                        ;
                        if (auctionsCard.player.activeClub != null) {
                            global.teamSlug = auctionsCard.player.activeClub.slug;
                            global.team = auctionsCard.player.activeClub.name;
                        }
                        else {
                            global.teamSlug = "";
                            global.team = "";
                        }
                        if (auctionsCard.player.activeClub != null) {
                            global.teamUrl = auctionsCard.player.activeClub.pictureUrl;
                        }
                        else {
                            global.teamUrl = "";
                        }
                        if (auctionsCard.player.activeClub = null) {
                            global.leagueslug = auctionsCard.player.activeClub.domesticLeague.slug;
                        }
                        else {
                            global.league = "other";
                        }
                        ;
                        if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                            global.competition = "champion-europe";
                        }
                        else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                            global.competition = "challenger-europe";
                        }
                        else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                            global.competition = "champion-asia";
                        }
                        else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                            global.competition = "champion-america";
                        }
                        else {
                            global.competition = "other";
                        }
                        ;
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/teamSlug'), (global.teamSlug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/team'), (global.team));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/teamUrl'), (global.teamUrl));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/leagueslug'), (global.leagueslug));
                        (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/myauctions/auction/' + i + '/competition'), (global.competition));
                    }
                }
                console.log("nombre auctions: ", tabAllAuctions.length);
                const allAuctions = tabAllAuctions.reduce(reducer).toFixed(3);
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/totalAuctions'), (+allAuctions));
            });
        }, 30000);
        // ########################################
        // directOffers(direction:SENT)############
        setTimeout(function () {
            return __awaiter(this, void 0, void 0, function* () {
                var userOfferReceived = [];
                var tabBalanceSent = [0];
                global.auctions = false;
                global.nextPage = "";
                do {
                    let variables;
                    let slug = global.nextPage;
                    variables = {
                        slug: slug,
                    };
                    const userOfferWallet = yield graphQLClient.request(GET_DIRECT_OFFER_RECEIVE_CURRENT_USER, variables);
                    global.userOfferReceivedNextPage = userOfferWallet.currentUser.directOffers.pageInfo.hasNextPage;
                    const userOfferReceivedEndCursor = userOfferWallet.currentUser.directOffers.pageInfo.endCursor;
                    global.nextPage = userOfferReceivedEndCursor;
                    const nbOfferReceived = userOfferWallet.currentUser.directOffers.nodes.length;
                    for (let i = 0; i < nbOfferReceived; i++) {
                        if (userOfferWallet.currentUser.directOffers.nodes[i] != null && userOfferWallet.currentUser.directOffers.nodes[i] != undefined) {
                            global.OfferReceived = true;
                            userOfferReceived.push(userOfferWallet.currentUser.directOffers.nodes[i]);
                        }
                    }
                } while (global.userOfferReceivedNextPage === true);
                if (global.OfferReceived === true) {
                    const nbOfferSReceived = userOfferReceived.length;
                    let f = -1;
                    for (let i = 0; i < nbOfferSReceived; i++) {
                        const aasmState = userOfferReceived[i].aasmState;
                        if (aasmState === "accepted") {
                            f++;
                            const id = userOfferReceived[i].id;
                            const creditCardFee = userOfferReceived[i].creditCardFee;
                            const acceptedAt = userOfferReceived[i].acceptedAt;
                            const sendWeiAmount = userOfferReceived[i].sendWeiAmount;
                            const receiveWeiAmount = userOfferReceived[i].receiveWeiAmount;
                            const nbOffertReceiveCards = userOfferReceived[i].receiveCardOffers.length;
                            const nbOffertSentCards = userOfferReceived[i].sendCardOffers.length;
                            tabBalanceSent.push((sendWeiAmount - receiveWeiAmount) / Math.pow(10, 18));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/transfert'), ("sent"));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/id'), (id));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/creditCardFee'), (creditCardFee));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/acceptedAt'), (acceptedAt));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receiveWeiAmount'), (sendWeiAmount / Math.pow(10, 18)));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sendWeiAmount'), (receiveWeiAmount / Math.pow(10, 18)));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/balance'), ((sendWeiAmount - receiveWeiAmount) / Math.pow(10, 18)));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/nbOffertCards'), (nbOffertSentCards));
                            if (userOfferReceived[i].receiveCardOffers != null) {
                                for (let g = 0; g < nbOffertReceiveCards; g++) {
                                    const id = userOfferReceived[i].receiveCardOffers[g].id;
                                    const rarete = userOfferReceived[i].receiveCardOffers[g].card.rarity;
                                    const age = userOfferReceived[i].receiveCardOffers[g].card.age;
                                    const cardSlug = userOfferReceived[i].receiveCardOffers[g].card.slug;
                                    const position = userOfferReceived[i].receiveCardOffers[g].card.player.position;
                                    const cardName = userOfferReceived[i].receiveCardOffers[g].card.name;
                                    const cardPicture = userOfferReceived[i].receiveCardOffers[g].card.pictureUrl;
                                    const displayName = userOfferReceived[i].receiveCardOffers[g].card.player.displayName;
                                    const playerSlug = userOfferReceived[i].receiveCardOffers[g].card.player.slug;
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/id'), (id));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/id'), (id));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/rarete'), (rarete));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/age'), (age));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/cardSlug'), (cardSlug));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/cardName'), (cardName));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/cardPicture'), (cardPicture));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/displayName'), (displayName));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/playerSlug'), (playerSlug));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/position'), (position));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/transfert'), ("received"));
                                    if (userOfferReceived[i].receiveCardOffers[g].card.player.activeClub != null) {
                                        global.teamSlug = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.slug;
                                        global.team = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.name;
                                    }
                                    else {
                                        global.teamSlug = "";
                                        global.team = "";
                                    }
                                    if (userOfferReceived[i].receiveCardOffers[g].card.player.activeClub != null) {
                                        global.teamUrl = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.pictureUrl;
                                    }
                                    else {
                                        global.teamUrl = "";
                                    }
                                    if (userOfferReceived[i].receiveCardOffers[g].card.player.activeClub != null) {
                                        global.leagueslug = userOfferReceived[i].receiveCardOffers[g].card.player.activeClub.domesticLeague.slug;
                                    }
                                    else {
                                        global.league = "other";
                                    }
                                    ;
                                    if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                                        global.competition = "champion-europe";
                                    }
                                    else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                                        global.competition = "challenger-europe";
                                    }
                                    else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                                        global.competition = "champion-asia";
                                    }
                                    else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                                        global.competition = "champion-america";
                                    }
                                    else {
                                        global.competition = "other";
                                    }
                                    ;
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/teamSlug'), (global.teamSlug));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/team'), (global.team));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/teamUrl'), (global.teamUrl));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/leagueslug'), (global.leagueslug));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/receivedCards/' + g + '/competition'), (global.competition));
                                }
                            }
                            if (userOfferReceived[i].sendCardOffers != null) {
                                for (let g = 0; g < nbOffertSentCards; g++) {
                                    const id = userOfferReceived[i].sendCardOffers[g].id;
                                    const rarete = userOfferReceived[i].sendCardOffers[g].card.rarity;
                                    const age = userOfferReceived[i].sendCardOffers[g].card.age;
                                    const cardSlug = userOfferReceived[i].sendCardOffers[g].card.slug;
                                    const position = userOfferReceived[i].sendCardOffers[g].card.player.position;
                                    const cardName = userOfferReceived[i].sendCardOffers[g].card.name;
                                    const cardPicture = userOfferReceived[i].sendCardOffers[g].card.pictureUrl;
                                    const displayName = userOfferReceived[i].sendCardOffers[g].card.player.displayName;
                                    const playerSlug = userOfferReceived[i].sendCardOffers[g].card.player.slug;
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/id'), (id));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/id'), (id));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/rarete'), (rarete));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/age'), (age));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/cardSlug'), (cardSlug));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/cardName'), (cardName));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/cardPicture'), (cardPicture));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/displayName'), (displayName));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/playerSlug'), (playerSlug));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/position'), (position));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/transfert'), ("sent"));
                                    if (userOfferReceived[i].sendCardOffers[g].card.player.activeClub != null) {
                                        global.teamSlug = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.slug;
                                        global.team = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.name;
                                    }
                                    else {
                                        global.teamSlug = "";
                                        global.team = "";
                                    }
                                    if (userOfferReceived[i].sendCardOffers[g].card.player.activeClub != null) {
                                        global.teamUrl = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.pictureUrl;
                                    }
                                    else {
                                        global.teamUrl = "";
                                    }
                                    if (userOfferReceived[i].sendCardOffers[g].card.player.activeClub != null) {
                                        global.leagueslug = userOfferReceived[i].sendCardOffers[g].card.player.activeClub.domesticLeague.slug;
                                    }
                                    else {
                                        global.league = "other";
                                    }
                                    ;
                                    if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                                        global.competition = "champion-europe";
                                    }
                                    else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                                        global.competition = "challenger-europe";
                                    }
                                    else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                                        global.competition = "champion-asia";
                                    }
                                    else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                                        global.competition = "champion-america";
                                    }
                                    else {
                                        global.competition = "other";
                                    }
                                    ;
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/teamSlug'), (global.teamSlug));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/team'), (global.team));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/teamUrl'), (global.teamUrl));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/leagueslug'), (global.leagueslug));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/sent/' + f + '/sentCards/' + g + '/competition'), (global.competition));
                                }
                            }
                        }
                    }
                }
                const allBalanceSent = tabBalanceSent.reduce(reducer).toFixed(3);
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/balanceSent'), (+allBalanceSent));
            });
        }, 30000);
        // ########################################
        // directOffers(direction:RECEIVE)############
        setTimeout(function () {
            return __awaiter(this, void 0, void 0, function* () {
                var userOfferSent = [];
                var tabBalanceReceived = [0];
                global.auctions = false;
                global.nextPage = "";
                do {
                    let variables;
                    let slug = global.nextPage;
                    variables = {
                        slug: slug,
                    };
                    const userOfferSentWallet = yield graphQLClient.request(GET_DIRECT_OFFER_SENT_CURRENT_USER, variables);
                    global.userOfferSentNextPage = userOfferSentWallet.currentUser.directOffers.pageInfo.hasNextPage;
                    const userOfferSentEndCursor = userOfferSentWallet.currentUser.directOffers.pageInfo.endCursor;
                    global.nextPage = userOfferSentEndCursor;
                    const nbOfferSent = userOfferSentWallet.currentUser.directOffers.nodes.length;
                    for (let i = 0; i < nbOfferSent; i++) {
                        if (userOfferSentWallet.currentUser.directOffers.nodes[i] != null && userOfferSentWallet.currentUser.directOffers.nodes[i] != undefined) {
                            global.OfferSent = true;
                            userOfferSent.push(userOfferSentWallet.currentUser.directOffers.nodes[i]);
                        }
                    }
                } while (global.userOfferSentNextPage === true);
                console.log(userOfferSent);
                if (global.OfferSent === true) {
                    const nbOfferSent = userOfferSent.length;
                    let h = -1;
                    for (let i = 0; i < nbOfferSent; i++) {
                        const aasmState = userOfferSent[i].aasmState;
                        if (aasmState === "accepted") {
                            h++;
                            const id = userOfferSent[i].id;
                            const creditCardFee = userOfferSent[i].creditCardFee;
                            const acceptedAt = userOfferSent[i].acceptedAt;
                            const sendWeiAmount = userOfferSent[i].sendWeiAmount;
                            const receiveWeiAmount = userOfferSent[i].receiveWeiAmount;
                            const nbOffertReceiveCards = userOfferSent[i].receiveCardOffers.length;
                            const nbOffertSentCards = userOfferSent[i].sendCardOffers.length;
                            tabBalanceReceived.push((receiveWeiAmount - sendWeiAmount) / Math.pow(10, 18));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/transfert'), ("received"));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/id'), (id));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/creditCardFee'), (creditCardFee));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/acceptedAt'), (acceptedAt));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sendWeiAmount'), (sendWeiAmount / Math.pow(10, 18)));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receiveWeiAmount'), (receiveWeiAmount / Math.pow(10, 18)));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/balance'), ((receiveWeiAmount - sendWeiAmount) / Math.pow(10, 18)));
                            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/nbOffertCards'), (nbOffertSentCards));
                            if (userOfferSent[i].receiveCardOffers != null) {
                                for (let g = 0; g < nbOffertReceiveCards; g++) {
                                    const id = userOfferSent[i].receiveCardOffers[g].id;
                                    const rarete = userOfferSent[i].receiveCardOffers[g].card.rarity;
                                    const age = userOfferSent[i].receiveCardOffers[g].card.age;
                                    const cardSlug = userOfferSent[i].receiveCardOffers[g].card.slug;
                                    const position = userOfferSent[i].receiveCardOffers[g].card.player.position;
                                    const cardName = userOfferSent[i].receiveCardOffers[g].card.name;
                                    const cardPicture = userOfferSent[i].receiveCardOffers[g].card.pictureUrl;
                                    const displayName = userOfferSent[i].receiveCardOffers[g].card.player.displayName;
                                    const playerSlug = userOfferSent[i].receiveCardOffers[g].card.player.slug;
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/id'), (id));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/id'), (id));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/rarete'), (rarete));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/age'), (age));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/cardSlug'), (cardSlug));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/cardName'), (cardName));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/cardPicture'), (cardPicture));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/displayName'), (displayName));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/playerSlug'), (playerSlug));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/position'), (position));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/transfert'), ("received"));
                                    if (userOfferSent[i].receiveCardOffers[g].card.player.activeClub != null) {
                                        global.teamSlug = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.slug;
                                        global.team = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.name;
                                    }
                                    else {
                                        global.teamSlug = "";
                                        global.team = "";
                                    }
                                    if (userOfferSent[i].receiveCardOffers[g].card.player.activeClub != null) {
                                        global.teamUrl = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.pictureUrl;
                                    }
                                    else {
                                        global.teamUrl = "";
                                    }
                                    if (userOfferSent[i].receiveCardOffers[g].card.player.activeClub != null && userOfferSent[i].receiveCardOffers[g].card.player.activeClub.domesticLeague != null) {
                                        global.leagueslug = userOfferSent[i].receiveCardOffers[g].card.player.activeClub.domesticLeague.slug;
                                    }
                                    else {
                                        global.league = "other";
                                    }
                                    ;
                                    if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                                        global.competition = "champion-europe";
                                    }
                                    else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                                        global.competition = "challenger-europe";
                                    }
                                    else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                                        global.competition = "champion-asia";
                                    }
                                    else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                                        global.competition = "champion-america";
                                    }
                                    else {
                                        global.competition = "other";
                                    }
                                    ;
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/teamSlug'), (global.teamSlug));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/team'), (global.team));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/teamUrl'), (global.teamUrl));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/leagueslug'), (global.leagueslug));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/receivedCards/' + g + '/competition'), (global.competition));
                                }
                            }
                            if (userOfferSent[i].sendCardOffers != null) {
                                for (let g = 0; g < nbOffertSentCards; g++) {
                                    const id = userOfferSent[i].sendCardOffers[g].id;
                                    const rarete = userOfferSent[i].sendCardOffers[g].card.rarity;
                                    const age = userOfferSent[i].sendCardOffers[g].card.age;
                                    const cardSlug = userOfferSent[i].sendCardOffers[g].card.slug;
                                    const position = userOfferSent[i].sendCardOffers[g].card.player.position;
                                    const cardName = userOfferSent[i].sendCardOffers[g].card.name;
                                    const cardPicture = userOfferSent[i].sendCardOffers[g].card.pictureUrl;
                                    const displayName = userOfferSent[i].sendCardOffers[g].card.player.displayName;
                                    const playerSlug = userOfferSent[i].sendCardOffers[g].card.player.slug;
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/id'), (id));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/id'), (id));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/rarete'), (rarete));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/age'), (age));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/cardSlug'), (cardSlug));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/cardName'), (cardName));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/cardPicture'), (cardPicture));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/displayName'), (displayName));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/playerSlug'), (playerSlug));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/position'), (position));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/transfert'), ("sent"));
                                    if (userOfferSent[i].sendCardOffers[g].card.player.activeClub != null) {
                                        global.teamSlug = userOfferSent[i].sendCardOffers[g].card.player.activeClub.slug;
                                        global.team = userOfferSent[i].sendCardOffers[g].card.player.activeClub.name;
                                    }
                                    else {
                                        global.teamSlug = "";
                                        global.team = "";
                                    }
                                    if (userOfferSent[i].sendCardOffers[g].card.player.activeClub != null) {
                                        global.teamUrl = userOfferSent[i].sendCardOffers[g].card.player.activeClub.pictureUrl;
                                    }
                                    else {
                                        global.teamUrl = "";
                                    }
                                    if (userOfferSent[i].sendCardOffers[g].card.player.activeClub != null) {
                                        global.leagueslug = userOfferSent[i].sendCardOffers[g].card.player.activeClub.domesticLeague.slug;
                                    }
                                    else {
                                        global.league = "other";
                                    }
                                    ;
                                    if (global.leagueslug === "bundesliga-de" || global.leagueslug === "premier-league-gb-eng" || global.leagueslug === "ligue-1-fr" || global.leagueslug === "serie-a-it" || global.leagueslug === "laliga-santander") {
                                        global.competition = "champion-europe";
                                    }
                                    else if (global.leagueslug === "jupiler-pro-league" || global.leagueslug === "eredivisie" || global.leagueslug === "primeira-liga-pt" || global.leagueslug === "spor-toto-super-lig" || global.leagueslug === "austrian-bundesliga" || global.leagueslug === "russian-premier-league" || global.leaguesug === "ukrainian-premier-league") {
                                        global.competition = "challenger-europe";
                                    }
                                    else if (global.leagueslug === "j1-league" || global.leagueslug === "k-league") {
                                        global.competition = "champion-asia";
                                    }
                                    else if (global.leagueslug === "superliga-argentina-de-futbol" || global.leagueslug === "campeonato-brasileiro-serie-a" || global.leagueslug === "mlspa" || global.leagueslug === "liga-mx") {
                                        global.competition = "champion-america";
                                    }
                                    else {
                                        global.competition = "other";
                                    }
                                    ;
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/teamSlug'), (global.teamSlug));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/team'), (global.team));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/teamUrl'), (global.teamUrl));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/leagueslug'), (global.leagueslug));
                                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/mydirectoffers/received/' + h + '/sentCards/' + g + '/competition'), (global.competition));
                                }
                            }
                        }
                    }
                }
                const allBalanceReceived = tabBalanceReceived.reduce(reducer).toFixed(3);
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/balanceReceived'), (+allBalanceReceived));
            });
        }, 30000);
        // #####SAVE HISTORY WALLET#####
        axios_1.default.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=EUR,USD&api_key=3407e811098c81482681d5f96768abacdaa1d3415dfd6f0befe66550a44b65a3').then(resp => {
            global.ethValue = resp.data;
            (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/watching/ethValue'), (resp.data));
            (0, database_1.onValue)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/'), (snapshot) => {
                const wallet = snapshot.val();
                if (wallet.historique != undefined) {
                    const nbHistory = wallet.historique.length;
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/historique/' + nbHistory), (wallet.watching));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/historique/' + nbHistory + '/date'), (Date()));
                }
                else {
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/historique/0/date'), (Date()));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/historique/0/balanceReceived'), (0));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/historique/0/balanceSent'), (0));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/historique/0/totalAuctions'), (0));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/historique/0/totalValueWallet'), (0));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/historique/0/totalWallet'), (0));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/historique/0/totalRewards'), (0));
                    (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/historique/0/ethValue'), (resp.data));
                }
                const points = wallet.points;
                const newPoints = points - 10;
                (0, database_1.set)((0, database_1.ref)((0, database_1.getDatabase)(), user + '/profil/points'), (newPoints));
                console.log(newPoints);
            }, { onlyOnce: true });
        });
        console.log("Toutes les data de cartes de : " + user + ' import??es');
    } while (+count < (+nbUsers - 1));
    res.redirect('/');
}));
//# sourceMappingURL=app.js.map