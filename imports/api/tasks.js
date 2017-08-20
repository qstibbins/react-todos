import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

if(Meteor.isServer){
    //This code only runs on the server
    Meteor.publish('tasks', function tasksPublication(){
        return Tasks.find({
            $or: [
                { private: { $ne: true } },
                { owner: this.userId },
            ]
        });
    })
}

Meteor.methods({
    'tasks.insert'(text){
        check(text, String);

        //Make sure the user is logged in before inserting a task
        if(!Meteor.userId()){
            throw new Meteor.Error('not-authorized');
        }

        Tasks.insert({
            text,
            createdAt: new Date(), //current time
            owner: Meteor.userId(), //_id of the logged in user
            username: Meteor.user().username, //username of logged in user
        });
    },
    'tasks.remove'(taskId){
        check(taskId, String);

        const task = Tasks.findOne(taskId);

        if(task.private && 
            task.owner !== Meteor.userId()){
            throw new Meteor.Error('not-authorized');
        }

        Tasks.remove(taskId);
    },
    'tasks.setChecked'(taskId, setChecked){
        check(taskId, String);
        check(setChecked, Boolean);

        const task = Tasks.findOne(taskId);
        if(task.private  && 
            task.owner !== Meteor.userId()){
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, { $set: { checked: setChecked} });
    },
    'tasks.setPrivate'(taskId, setToPrivate){
        check(taskId, String);
        check(setToPrivate, Boolean);

        const task = Tasks.findOne(taskId);

        //Make sure that only the task owner can make task private
        if(task.owner !== Meteor.userId()){
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, { $set: { private: setToPrivate } });
    },
});