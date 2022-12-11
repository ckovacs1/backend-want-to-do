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

//offset for copied todos
const getRepeatTodosByDayOffset = (todo, dayOffset) => {
  const repeatTodos = [];
  for (let i = 0; i < todo.repetition; i++) {
    const copiedTodo = copyTodo(todo);
    copiedTodo.startDateTime.setDate(
      copiedTodo.startDateTime.getDate() + i * dayOffset,
    );

    // overwrite copiedTodo repeat
    const repeatIdx = i - 1;
    if (repeatIdx >= 0) {
      copiedTodo.repeatIdx = repeatIdx;
      copiedTodo.parentId = todo._id;
      copiedTodo.complete = copiedTodo.repeat[repeatIdx].complete;
    }

    repeatTodos.push(copiedTodo);
  }

  return repeatTodos;
};

/**
 * Make array contains original and repeat todos
 * @param {*} todo
 * @param {*} monthOffset
 * @returns
 */
const getRepeatTodosByMonthOffset = (todo, monthOffset) => {
  const repeatTodos = [];
  for (let i = 0; i < todo.repetition; i++) {
    const copiedTodo = copyTodo(todo);
    copiedTodo.startDateTime.setMonth(
      copiedTodo.startDateTime.getMonth() + i * monthOffset,
    );

    // overwrite copiedTodo repeat
    const repeatIdx = i - 1;
    if (repeatIdx >= 0) {
      copiedTodo.repeatIdx = repeatIdx;
      copiedTodo.parentId = todo._id;
      copiedTodo.complete = copiedTodo.repeat[repeatIdx].complete;
    }

    repeatTodos.push(copiedTodo);
  }

  return repeatTodos;
};

//offset for daily, weekly, and monthly
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
