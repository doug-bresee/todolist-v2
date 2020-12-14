

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true,
//                                                          useUnifiedTopology: true });





   mongoose.connect("mongodb+srv://admin-doug:test123@cluster0.be2gk.mongodb.net/todolistDB", { useNewUrlParser: true,
                                                                                                                                      useUnifiedTopology: true });



//copied from mongo db site
// removed mongoDB from git hub



 const itemsSchema = new mongoose.Schema({
   name: String
   });

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Dishes"
    });

const item2 = new Item({
    name: "Udemy class"
    });

const item3 = new Item({
    name: "Great courses"
    });

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List  = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

    Item.find({}, function(err, foundItems) {
      if (foundItems.length === 0 ){
        Item.insertMany(defaultItems , function(err) {
            if(err){
              console.log(err);
             } else{
                console.log("good insert");
              }
        } );
        res.redirect("/");
      } else{
         res.render("list", {listTitle: "Today", newListItems: foundItems});
       }
  } );

});




app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);


    List.findOne({name: customListName}, function(err, foundList){
        if (!err){
            if (!foundList)
            {
              const list = new List({
                name: customListName,
                items: defaultItems
              });

              list.save();

              res.redirect("/"  + customListName);
            }else{

              res.render("list", {listTitle: foundList.name, newListItems: foundList.items});

           }
      }
   });



  });



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
      name: itemName
      });

      if(listName === "Today"){
        item.save();
        res.redirect("/");
      }else{
        List.findOne({name: listName}, function(err, foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName);
           })
      }

});



app.post("/delete", function(req, res){

 const checkItemId = req.body.checkbox;
 const listName = req.body.listName;

   if(listName === "Today"){
       Item.findByIdAndRemove(checkItemId , function(err) {
           if(err){
             console.log(err);
            } else{
               console.log("good");
               res.redirect("/");
             }
       });
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId }}}, function(err, foundList){
          if(!err){
              res.redirect("/" + listName);
          }
        });
   }



});




app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000
}


app.listen(port, function() {
  console.log("Server has started on port 3000");
});
