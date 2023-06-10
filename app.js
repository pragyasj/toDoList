

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://pragyashreejaiswal:security1ON@cluster0.8mda2xg.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit + to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const listSchema = {
  name:String,
  items:[itemsSchema]
}

const defaultItems = [item1, item2, item3];

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {



  Item.find({}).then(function(foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems)
  .then(function(){
    console.log("succefully saved in our db");
  })
    .catch(function(err){
      console.log(err);
    });
    res.redirect("/");
    } else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

    
  })
    .catch(function(err){
      console.log(err);
    })

  });

app.post("/", async(req, res) => {

  const itemName = req.body.newItem;
  let listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save()
    res.redirect("/")
} else {

    await List.findOne({ name: listName }).exec().then(foundList => {
        foundList.items.push(item)
        foundList.save()
        res.redirect("/" + listName)
    }).catch(err => {
        console.log(err);
    });
}
 
});

app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
 
  if (listName === "Today" && checkedItemId != undefined) {
      await Item.findByIdAndRemove(checkedItemId);
      res.redirect("/");  
  } else {
    await List.findOneAndUpdate( { name: listName },
      { $pull: { items: { _id: checkedItemId } } } );
    res.redirect("/" + listName);
  }
 
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName})
  .then(function(foundList){
      
        if(!foundList){
          const list = new List({
            name:customListName,
            items:defaultItems
          });
        
          list.save();
          console.log("saved");
          res.redirect("/"+customListName);
        }
        else{
          res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
        }
  })
  .catch(function(err){});


})

app.get("/about", function(req, res){
  res.render("about");
});

const port = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(port, function() {
  console.log("Server started on port ${port}");
});
