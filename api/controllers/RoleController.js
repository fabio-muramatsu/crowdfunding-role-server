/*jshint esversion: 6 */

/**
 * RoleController
 *
 * @description :: Server-side logic for managing roles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

check_params = function(req){
	if(!req.param('id') || !req.param('where') || !req.param('when') ||
		!req.param('cost') || !req.param('members'))
		return false;
	else return true;
};

module.exports = {
	create: (req, res) => {
		console.log("Called create " + req.session.user);
		coordinator = req.session.user;
		if(!check_params(req)){
			res.status = 400;
			return res.send("Invalid JSON");
		}

		obj = {};
		obj.role_id = req.param('id');
		obj.where = req.param('where');
		obj.when = req.param('when');
		obj.cost = req.param('cost');
		obj.coordinator = coordinator;
		members = JSON.parse(req.param('members')).map((item) => {return item.toString();});
		console.log(members);
		User.find({user_id: members}).exec((err, users) => {
			if(err){
				res.status(400);
				return res.send("Error creating users for role: " + err);
			}
			console.log(users);
			Role.create(obj).exec((err, role) => {
				if(err){
					res.status(400);
					return res.send("Error creating role: " + err);
				}
				payments = [];
				for(var user of users){
					payments.push({payment_user: user, payment_role: role, value: 0});
				}
				console.log(payments);
				Payment.create(payments).exec((err, created_payments) => {
					console.log(created_payments);
					if(err){
						res.status(400);
						return res.send("Error creating payment: " + err);
					}
					return res.send("Inserted");
				});
			});
		});
	},

	getByUser: function(req, res){
		user_id = req.param('id');
		role_ids = [];
		User.findOne({user_id: user_id}).populate('payments').exec((err, user) => {
			for(var payment of user.payments){
				role_ids.push(payment.payment_role);
			}
			console.log(role_ids);
			Role.find({id: role_ids}).exec((err, roles) => {
				console.log(users);
				res.send(roles);
			});
		});
	}
};
