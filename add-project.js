'use strict';
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
var fs = require('fs');
let config = require("../../" + env + "_config");
const q = require('q');
const Site = require('./../utils/sequelizeConn').Site;
const Role = require('./../utils/sequelizeConn').Role;
const User = require('./../utils/sequelizeConn').User;
const Project = require('./../utils/sequelizeConn').Project;
const ProjectSite = require('./../utils/sequelizeConn').ProjectSite;

const { Op } = require('sequelize');

exports.addProject = async function (req, res) {
    let { project_name, valid_upto, sites } = req.body;

    if (project_name != undefined && project_name != null && project_name.trim() != "" && valid_upto != undefined && valid_upto != null && valid_upto.trim() != "") {
        let projectCreateData = {
            project_name: project_name,
            valid_upto: valid_upto,
            user_id: req.user.id,
        };

        try {
            // Check if the project already exists
            let existingProject = await Project.findOne({ where: { 
            project_name: project_name, 
            status: { [Op.ne]: 'DELETED' } ,
            user_id: req.user.id }
             });
            if (existingProject) {
                return res.status(200).send({ status: 0, msg: "Project with this name already exists" });
            }

            let projectCreateRes = await Project.create(projectCreateData);
            console.log("the projectCreateRes is", projectCreateRes);


            const findMasterRole = await Role.findOne({ where: { role_name: 'master' } });

            if (req.user.role != findMasterRole.id) {
                let updateUser = await User.update({ access_level: 0, access_level_id: projectCreateRes.id }, { where: { id: req.user.id } });
            }

            res.status(200).send({ status: 1, msg: "Project Created Successfully ", data: projectCreateRes });
        } catch (err) {
            console.log("error while creating project", err);
            res.status(200).send({ status: 0, msg: "Error while creating project" });
        }
    } else {
        res.status(200).send({ status: 0, msg: "Invalid Params" });
    }
}
