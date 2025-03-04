let express = require('express');
let informationDB = require('../models/information_db');
let router = express.Router();
let bodyParser = require('body-parser');
let co=require('co');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
var ObjectID = require('mongodb').ObjectID;

// 跨域header设定
router.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By",' 3.2.1')
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});


//temp add account
router.post('/account', urlencodedParser, function (req, res, next) {
	let UserData = {
		account: req.body.account,
		password: req.body.password,
	}
	
	let accountCollection = informationDB.getCollection("StudentUnion","ACCOUNT");
	accountCollection.findOne({account: UserData.account}, function (err, data) {
		if (!data) {
			accountCollection.insert(UserData)
			res.status(200).json({ "code": "1" ,"msg": "添加成功"})
		}
		else {
			res.status(200).json({ "code": "-1" ,"msg": "已有账号"})
		}

	});
});



/*
 * @function 管理员登录
 * @param account(string) 账户, password(string) 密码
 * @return code(int) , mag(string)
 */
router.post('/login', urlencodedParser, function (req, res, next) {
	let UserData = {
		account: req.body.account,
		password: req.body.password
	}
	
	let accountCollection = informationDB.getCollection("StudentUnion","ACCOUNT");
	accountCollection.findOne({account: UserData.account}, function (err, data) {
		if (data) {
			if (UserData.password == data.password){
				res.status(200).json({ "code": "1" ,"msg": "登陆成功"})
			}
			else {
				res.status(200).json({ "code": "-1" ,"msg": "密码错误"})
			}
		}
		else {
			res.status(200).json({ "code": "-1" ,"msg": "查无此人"})
		}

	});
});


/*
 * @function 管理员修改密码
 * @param account(string) 账户, password(string) 密码, newPassword(string) 新密码
 * @return code(int) , mag(string)
 */
router.post('/updatePassword', urlencodedParser, function (req, res, next) {
	let UserData = {
		account: req.body.account,
		password: req.body.password,
		newPassword: req.body.newPassword
	}
	
	let accountCollection = informationDB.getCollection("StudentUnion","ACCOUNT");
	accountCollection.findOne({account: UserData.account}, function (err, data) {
		if (data) {
			if (UserData.password == data.password){
				accountCollection.update({account: UserData.account}, {$set:{'password': UserData.newPassword}})
				res.status(200).json({ "code": "1" ,"msg": "修改成功"})
			}
			else {
				res.status(200).json({ "code": "-1" ,"msg": "密码错误"})
			}
		}
		else {
			res.status(200).json({ "code": "-1" ,"msg": "查无此人"})
		}

	});
});

/*
 * @function 部门信息修改
 * @param departMent_detail(string) 部门信息
 * @return code(int) , mag(string)
 */
router.post('/department', urlencodedParser, function (req, res, next) {
	let department = {
		account: req.body.account,
		name:       req.body.name,
		describe:   req.body.describe,
		imgs:       req.body.imgs,
		phone:      req.body.phone,
		email:      req.body.email,
		qq:         req.body.qq,
		departFunction: req.body.departFunction,
		activity:   req.body.activity,
		fullName:   req.body.fullName
	}
	console.log(req.body)
	department.imgs = JSON.parse(department.imgs)
	console.log(req.body)

	let departmentCollection=informationDB.getCollection("StudentUnion","DEPARTMENT");

	departmentCollection.findOne({name: department.name}, function (err, departmentData) {
		if(departmentData){
			department._id=ObjectID(departmentData._id);
			departmentCollection.save(department);
			res.status(200).json({"code":1,"msg":"修改成功"});
		}
		else{
			departmentCollection.insert(department);
			res.status(200).json({"code":1,"msg":"提交成功"});
		}
	})
});



/*
 * @function 部门信息获取
 * @param name(string) 部门名称
 * @return department 部门信息
 */
router.get('/department', urlencodedParser, function (req, res, next) {
	let params = req.query;

	let departmentCollection = informationDB.getCollection("StudentUnion","DEPARTMENT");
	departmentCollection.findOne({name: params.name}, function (err, data) {
		if(data){
			res.status(200).json({department: data})
		}
		else{
			res.status(200).json({department: []})
		}

	});
});


router.get('/Alldepartment', urlencodedParser, function (req, res, next) {

	let departmentCollection = informationDB.getCollection("StudentUnion","DEPARTMENT");
	departmentCollection.find().sort({"name":-1}).toArray(function (err, allData) {
		if(allData.length!=0){
			res.status(200).json({
				code: 1,
				msg:  "查询成功",
				data: allData
			});
		}
		else{
			res.status(200).json({
				code:  -1,
				msg:   "没有部门",
				data:  []
			})
		}

	})
});


/*
 * @function 招新表单提交
 * @param name(string)名字，sex(bool)性别,class(string)班级,phone(string)电话,uid(string)学号,
 *        FirstrExcept(string)第一志愿,SecondExcept(string)第二志愿,AdjustedOrNot(bool)是否选择调剂,
 *        SelfIntroduction(string)个人简介
 * @return code(int) , msg(string)
 */
router.post('/sign', urlencodedParser, function (req, res, next) {
	let submitData = {
		img:				req.body.img,
		name:               req.body.name,
		sex:                req.body.sex,
		class:              req.body.class,
		phone:              req.body.phone,
		uid:                req.body.uid,
		hobby:   			req.body.hobby,
		FirstExcept:        req.body.FirstExcept,
		SecondExcept:       req.body.SecondExcept,
		AdjustedOrNot:      req.body.AdjustedOrNot,
		SelfIntroduction:   req.body.SelfIntroduction,
		city:				req.body.city
	}
	console.log(req.body);
	
	let enrollmentCollection = informationDB.getCollection("StudentUnion","ENROLLMENT");
	enrollmentCollection.findOne({uid: submitData.uid}, function (err, data) {
		console.log(data);
		if (data) {
			submitData._id = ObjectID(data._id)
			enrollmentCollection.save(submitData);
			res.status(200).json({"code": 1,"msg":"修改成功"});
		}
		else {
			enrollmentCollection.insert(submitData);
			res.status(200).json({ "code": 1 ,"msg": "提交成功"});
		}

	});
});

/*
 * @function 提交信息查询
 * @param uid(string) 学号
 * @return code(int)状态码,msg(string)提示信息,data(json)详细数据
 */
router.get('/sign', urlencodedParser, function (req, res, next) {
	let params = req.query;

	let enrollmentCollection = informationDB.getCollection("StudentUnion","ENROLLMENT");
	// console.log(id)

	enrollmentCollection.findOne({uid: params.uid}, function (err, data) {
		if(data){
			if(data.phone==params.phone) {
				res.status(200).json({
					code: 1,
					msg:  "查询成功",
					data: data
					})
			}
			else {
				res.status(200).json({
					code: -1,
					msg:  "手机号错误",
					data: {}
				})
			}

		}
		else{
			res.status(200).json({
				code: -1,
				msg:  "你丫还没提交过",
				data: {}
			})
		}

	});

});

/*
 * @function 条件查询大家提交的信息个数
 * @param key查询的字段名字
 * @return {"key":value}返回相应字段的数量
 */
router.get('/condCount',urlencodedParser, function(req,res,nest){

	// let colData = ["sex","class","FirstExcept","SecondExcept","AdjustedOrNot","city"];
	let col =req.body.colName;
	console.log(col);
	if(!col)
	{
		res.status(200).json({
			code: -1,
			msg: "None colName",
			data: null
		});
		return;
	}

	let enrollmentCollection = informationDB.getCollection("StudentUnion","ENROLLMENT");
	// var aggreData={
	// 	sex:                null,
	// 	class:              null,
	// 	FirstExcept:        null,
	// 	SecondExcept:		null,
	// 	AdjustedOrNot:      null,
	// 	city:				null
	// };
	
		// for(i1=0; i1<colData.length; i1++){
			enrollmentCollection.aggregate([
				{$group : {_id : ("$"+col), whole: {$sum : 1} } }
			]).toArray(function(err,allData){
				// aggreData[String(colData[i1])]=allData;
				// console.log(aggreData);
				res.status(200).json({
					code : 1,
					msg: "success with col:"+col,
					data: allData
				})
			});
		// };

		// console.log(aggreData);
		// res.status(200).json(aggreData);

});

/*

 * @function 查询大家提交的信息
 * @param FirstExcept(string)第一志愿，SecondExcept(string)第二志愿，sex(bool)性别
 * @return code(int)状态码，msg(string)提示信息,data([json])详细数据
 */
router.get('/sign/searchAll', urlencodedParser, function (req, res, next) {
	let params = req.query;

	let enrollmentCollection = informationDB.getCollection("StudentUnion","ENROLLMENT");

	// let condition = ''
	// condition = condition + '{'
	// if(params.FirstExcept != "")
	// 	condition = condition + '"FirstExcept": ' + '"' + params.FirstExcept + '",'
	// if(params.SecondExcept != "")
	// 	condition = condition + '"SecondExcept": ' + '"' + params.SecondExcept + '",'
	// if(params.sex != "")
	// 	condition = condition + '"sex": '  + '"' + params.sex + '",'
	// if(condition != "{")
	// 	condition = condition.substring(0, condition.lastIndexOf(',')); 
	// condition = condition + '}'
	// console.log(condition);
	// // let condition = '{"FirstExcept": "科协技术部","SecondExcept": "某某部","sex": "1"}'
	// let conditionJson = JSON.parse(condition)
	// console.log(conditionJson);
	enrollmentCollection.find().toArray(function (err, allData) {
		console.log(allData.length)
		if(allData.length!=0){
			res.status(200).json({
				code: 1,
				msg:  "查询成功",
				data: allData
			});
		}
		else{
			res.status(200).json({
				code:  -1,
				msg:   "居然没有符合条件的学妹/弟？！",
				data:  []
			})
		}

	})

});



module.exports = router;

