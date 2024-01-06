import { schedules } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as validation from '../validators.js';

const exportedMethods = {
    async getAllSchedules() {
        const scheduleCollection = await schedules();
        return await scheduleCollection.find({}).toArray();
    },
    async getScheduleById(id) {
        id = validation.validId(id, "Id");
        const scheduleCollection = await schedules();
        const schedule = await scheduleCollection.findOne({ _id: new ObjectId(id) });
        if (!schedule) throw 'Error: Schedule not found';
        return schedule;
    },
    async createSchedule(employeeName, employeeId, week, Sun, Mon, Tue, Wed, Thu, Fri, Sat){
        try{
            employeeName = validation.validName(employeeName);
            employeeId = validation.validId(employeeId);
            week = validation.validDate(week);
            Sun = validation.validWorkDay(Sun);
            Mon = validation.validWorkDay(Mon);
            Tue = validation.validWorkDay(Tue);
            Wed = validation.validWorkDay(Wed);
            Thu = validation.validWorkDay(Thu);
            Fri = validation.validWorkDay(Fri);
            Sat = validation.validWorkDay(Sat);
        }
        catch(e){
            throw e;
        }

        const scheduleCollection = await schedules();

        const findWeek = await scheduleCollection.findOne({ employeeId: employeeId, week: week });
        if (findWeek) {
            throw `Error: schedule already exists for that week for that employee.`;
        }

        const hours = {
            Sun: Sun,
            Mon: Mon,
            Tue: Tue,
            Wed: Wed,
            Thu: Thu,
            Fri: Fri,
            Sat: Sat
        }

        const newSchedule = {
            employeeName: employeeName,
            employeeId: employeeId,
            week: week,
            hours: hours
        }

        let insertInfo = await scheduleCollection.insertOne(newSchedule);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
            throw 'Error: Failed to add schedule';
        }
        return { admittedSchedule: true };
    },
    async updateSchedule(employeeName, employeeId, week, Sun, Mon, Tue, Wed, Thu, Fri, Sat) {
        try{
            employeeName = validation.validName(employeeName);
            employeeId = validation.validId(employeeId);
            week = validation.validDate(week);
            Sun = validation.validWorkDay(Sun);
            Mon = validation.validWorkDay(Mon);
            Tue = validation.validWorkDay(Tue);
            Wed = validation.validWorkDay(Wed);
            Thu = validation.validWorkDay(Thu);
            Fri = validation.validWorkDay(Fri);
            Sat = validation.validWorkDay(Sat);
        }
        catch(e){
            throw e;
        }

        const scheduleCollection = await schedules();

        const scheduleInfo = await scheduleCollection.findOne({ employeeId: employeeId, week: week });
        if (!findWeek) {
            throw `Error: schedule already doesn't exist for that week for that employee.`;
        }

        const hours = {
            Sun: Sun,
            Mon: Mon,
            Tue: Tue,
            Wed: Wed,
            Thu: Thu,
            Fri: Fri,
            Sat: Sat
        }

        const updateScheduleInfo = await scheduleCollection.updateOne(
            { _id: scheduleInfo._id },
            { $set: {employeeName: employeeName} },
            { $set: {employeeId: employeeId} },
            { $set: {week: week} },
            { $set: {hours: hours} }
        )
        if (updateScheduleInfo.modifiedCount !== 0){
            return {updatedSchedule : true};
        }
    }
}