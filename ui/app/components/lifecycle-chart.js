import Component from '@ember/component';
import { computed } from '@ember/object';
import { sort } from '@ember/object/computed';

export default Component.extend({
  tagName: '',

  tasks: null,
  taskStates: null,

  lifecyclePhases: computed('tasks.@each.lifecycle', 'taskStates.@each.state', function() {
    const tasksOrStates = this.taskStates || this.tasks;
    const lifecycles = {
      prestarts: [],
      sidecars: [],
      mains: [],
      poststops: [],
    };

    tasksOrStates.forEach(taskOrState => {
      const task = taskOrState.task || taskOrState;
      lifecycles[`${task.lifecycleName}s`].push(taskOrState);
    });

    const phases = [];

    if (lifecycles.prestarts.length || lifecycles.sidecars.length) {
      phases.push({
        name: 'Prestart',
        class: 'prestart',
        isActive: lifecycles.prestarts.some(state => state.state === 'running'),
      });
    }

    if (lifecycles.sidecars.length || lifecycles.mains.length) {
      phases.push({
        name: 'Main',
        class: 'main',
        isActive: lifecycles.mains.some(state => state.state === 'running'),
      });
    }

    if (lifecycles.poststops.length) {
      phases.push({
        name: 'Poststop',
        class: 'poststop',
        isActive: lifecycles.poststops.some(state => state.state === 'running'),
      });
    }

    return phases;
  }),

  sortedLifecycleTaskStates: sort('taskStates', function(a, b) {
    return getTaskSortPrefix(a.task).localeCompare(getTaskSortPrefix(b.task));
  }),

  sortedLifecycleTasks: sort('tasks', function(a, b) {
    return getTaskSortPrefix(a).localeCompare(getTaskSortPrefix(b));
  }),
});

const lifecycleNameSortPrefix = {
  prestart: 0,
  sidecar: 1,
  main: 2,
  poststop: 3,
};

function getTaskSortPrefix(task) {
  // Prestarts first, then sidecars, then mains, then poststops
  return `${lifecycleNameSortPrefix[task.lifecycleName]}-${task.name}`;
}
