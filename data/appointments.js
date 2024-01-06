import { appointments, employees } from '../config/mongoCollections.js';
import employeeFunc from "./employees.js";
import { ObjectId } from 'mongodb';
import * as validation from '../validators.js';

const exportedMethods = {
    async getAllAppointments() {
        const appointmentCollection = await appointments();
        return await appointmentCollection.find({}).toArray();
    },
    async getAppointmentById(id) {
        id = validation.validId(id, "Id");
        const appointmentCollection = await appointments();
        const appointment = await appointmentCollection.findOne({ _id: new ObjectId(id) });
        if (!appointment) throw 'Error: appointment not found';
        return appointment;
    },
    async createAppointment(customerId, barberId, date, startTime, endTime, serviceId) {
        try{
            customerId = validation.validId(customerId);
            barberId = validation.validId(barberId);
            serviceId = validation.validId(serviceId);
            date = validation.validDate(date);
            startTime = validation.validTime(startTime, endTime)[0];
            endTime = validation.validTime(startTime, endTime)[1];
        }
        catch(e){
            throw e;
        }
        try{
            if(employeeFunc.isFree(barberId, date, startTime, endTime) === false){
                throw "Date and Time is not free for barber";
            }
        }
        catch(e){
            throw e;
        }
        let newAppointment = {
            customerId: customerId,
            barberId: barberId,
            serviceId: serviceId,
            date: date,
            startTime: startTime,
            endTime: endTime
        }
        const appointmentCollection = await appointments();
        let insertInfo = await appointmentCollection.insertOne(newAppointment);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
            throw 'Error: Failed to add appointment';
        }
        return { insertedAppointment: true };
    },
    async updateAppointment(customerId, barberId, date, startTime, endTime, serviceId, newDate, newTime) {
        try{
            customerId = validation.validId(customerId);
            barberId = validation.validId(barberId);
            serviceId = validation.validId(serviceId);
            date = validation.validDate(date);
            startTime = validation.validTime(startTime, endTime)[0];
            endTime = validation.validTime(startTime, endTime)[1];
            newDate = validation.validDate(newDate);
            newTime = validation.validTime(newTime);
        }
        catch(e){
            throw e;
        }
        try{
            if(employeeRole !== "admin"){
                throw "employees without admin role cannot admit new employees";
            }
        }
        catch(e){
            throw e;
        }
        try{
            if(employeeFunc.isFree(barberId, date, startTime, endTime) === false){
                throw "Date and Time is not free for barber";
            }
        }
        catch(e){
            throw e;
        }
        const appointmentCollection = await appointments();
        
        const appointmentInfo = await appointmentCollection.findOne({ date: date, time: time, customerId: customerId, serviceId: serviceId });

        const updateAppointmentInfo = await appointmentCollection.updateOne(
            { _id: appointmentInfo._id },
            { $set: {date: newDate} },
            { $set: {time: newTime} }
        );
        if (updateAppointmentInfo.modifiedCount !== 0){
            return {updatedAppointment : true};
        }
    }
}

export default exportedMethods;