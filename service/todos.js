const { v4: uuidv4 } = require('uuid');
const toDos = require('../models/WantToDos');

const REPEAT_TYPE = {
  DAILY: 1,
  WEEKLY: 2,
  MONTHLY: 3,
};

const copyTodo = todo => {
  let obj = todo.toObject();
  const clonedObj = new toDos(obj);
  clonedObj._id = uuidv4();
  return clonedObj;
};

const getRepeatTodosByDayOffset = (todo, dayOffset) => {
  const repeatTodos = [];
  for (let i = 0; i < todo.repetition; i++) {
    const copiedTodo = copyTodo(todo);
    copiedTodo.startDateTime.setDate(
      copiedTodo.startDateTime.getDate() + i * dayOffset,
    );
    repeatTodos.push(copiedTodo);
  }

  return repeatTodos;
};

const getRepeatTodosByMonthOffset = (todo, monthOffset) => {
  const repeatTodos = [];
  for (let i = 0; i < todo.repetition; i++) {
    const copiedTodo = copyTodo(todo);
    copiedTodo.startDateTime.setMonth(
      copiedTodo.startDateTime.getMonth() + i * monthOffset,
    );
    repeatTodos.push(copiedTodo);
  }

  return repeatTodos;
};

const getTodosByRepetition = todo => {
  let repeatTodos = [];

  if (todo.repeatType === REPEAT_TYPE.DAILY) {
    const dayOffset = 1;
    repeatTodos = getRepeatTodosByDayOffset(todo, dayOffset);
  } else if (todo.repeatType === REPEAT_TYPE.WEEKLY) {
    const dayOffset = 7;
    repeatTodos = getRepeatTodosByDayOffset(todo, dayOffset);
  } else if (todo.repeatType === REPEAT_TYPE.MONTHLY) {
    const monthOffset = 1;
    repeatTodos = getRepeatTodosByMonthOffset(todo, monthOffset);
  }

  return repeatTodos;
};

module.exports = {
  getTodosByRepetition,
};
