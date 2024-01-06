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
            if(timeTaken % 10 !== 0){
                throw "Service Time must be a multiple of 10.";
            }
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
    async updateService(name, newDescription, newPrice, newTimeTaken, employeeRole) {
        try{
            name = validation.validString(name, "Service Name");
            newDescription = valiation.validBio(newDescription, "Description");
            newPrice = validation.validNumber(newPrice, "Price");
            newTimeTaken = validation.validNumber(newTimeTaken, "Time Taken");
            if(newTimeTaken % 10 !== 0){
                throw "Service Time must be a multiple of 10.";
            }
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

        const serviceCollection = await services();

        const serviceInfo = await serviceCollection.findOne({ name: name });

        const updateServiceInfo = await serviceCollection.updateOne(
            { _id: serviceInfo._id },
            { $set: {description: newDescription} },
            { $set: {price: newPrice} },
            { $set: {timeTaken : newTimeTaken} }
        )
        if (updateServiceInfo.modifiedCount !== 0){
            return {updatedService : true};
        }
    }
}

export default exportedMethods;