

var top_level = new chinood.models.Top('top_key');

var level1_1 = new chinood.models.Level1('level1_1_key');
var level1_2 = new chinood.models.Level1('level1_2_key');
var level1_3 = new chinood.models.Level1('level1_3_key');

var level2_1 = new chinood.models.Level2('level2_1_key');
var level2_2 = new chinood.models.Level2('level2_2_key');
var level2_3 = new chinood.models.Level2('level2_3_key');
var level2_4 = new chinood.models.Level2('level2_4_key');
var level2_5 = new chinood.models.Level2('level2_5_key');

level1_1.level2_1 = level2_1;
level1_2.level2_arr.push(level2_2, level2_3);
level1_3.level2_obj[level2_4.key] = level2_4;
level1_3.level2_obj[level2_5.key] = level2_5;

top_level.level1_1 = level1_1;
top_level.level1_arr.push(level1_2, level1_3);

var one = new chinood.models.Top('1');
var twelve = new chinood.models.Top('12');

one.foo = "true";
twelve.foo = "false";

console.log(one instanceof BaseModel);

// one.save(function(){});
// twelve.save(function(){});

// var temp = new chinood.models.MyModel('frank');
// console.log(temp.my_other_mod_arr);

// temp.save(function(err, data) {
//     console.log(data.my_other_mod_arr);
// });

// top_level.save(function(err, result) {
//     console.log("SAVED####");
//     console.log(result);
// });

var stuff = { foo: "ars" };
var top = new chinood.models.Top('ttttop', stuff, true);

// chinood.models.Top.find({keys: ['top_key', '1', '12']}, function(err, result) {
//     console.log("FOUND!!!");
//     //console.log(result[0]);
//     console.log(result[0].foo);
//     result[1].foo = "moolina";
//     console.log(result[1].foo);
//     console.log(result[0].foo);
// });

// var new_top = new chinood.models.Top('top_key');
// new_top.fetch(1, function(err, result) {
//     console.log(result);
// });