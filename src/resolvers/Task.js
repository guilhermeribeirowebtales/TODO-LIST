const taskResolvers = {
  Task: {
    total_caracters(parent) {
      return parent.description ? parent.description.length : 0;
    },
  },
};

module.exports = taskResolvers;

/** 
 * Because the project auto-discovers all resolver files in src/resolvers/, 
 * the new Task.js is automatically merged in — no extra wiring needed. 
 * When you query a task and include total_caracters, 
 * GraphQL will call the internal resolver after the parent query resolves, 
 * counting the characters in description and returning the value.
 */

// Schema is mostly calculated, if i alter this and i have 1000 records, those records
// will be recalculated, making my app much more reactive