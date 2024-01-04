import { services } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as validation from '../validators.js';

const exportedMethods = {
    async createService(name, description, price, timeTaken) {
        try{
            name = validation.validString(name);
            description = validation.validBio(description);
            price = validation.validNumber(price);
            timeTaken = validation.validNumber(timeTaken);
        }
        catch(e){
            throw e;
        }
        let newService = {
            name: name,
            description: description,
            price: price,
            timeTaken: timeTaken
        }
        const serviceCollection = await services();
        let insertInfo = await serviceCollection.insertOne(newService);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
            throw 'Error: Failed to add service';
        }
        return { insertedService: true };
    },
    async updateService(name, description, price, timeTaken, employeeRole) {
        try{
            name = validation.validString(name, "Service Name");
            description = validation.validBio(description, "Description");
            price = validation.validNumber(price, "Price");
            timeTaken = validation.validNumber(timeTaken, "Time Taken");
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
        const serviceInfo = await serviceCollection.findOne({ name: name });

        const updateServiceInfo = await employeeCollection.updateOne(
            { _id: serviceInfo._id },
            { $set: {description: description} },
            { $set: {price: price} },
            { $set: {timeTaken : timeTaken} }
        );
    },
}

export default exportedMethods;