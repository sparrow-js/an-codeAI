function sequence(tasks: any, names: any, results: any, missing: any, recursive: any, nest: any) {
    names.forEach((name: any) => {
      if (results.indexOf(name) !== -1) {
        return; // de-dup results
      }
      const node = tasks[name];
      if (!node) {
        missing.push(name);
      } else if (nest.indexOf(name) > -1) {
        nest.push(name);
        recursive.push(nest.slice(0));
        nest.pop(name);
      } else if (node.dep.length) {
        nest.push(name);
        sequence(tasks, node.dep, results, missing, recursive, nest); // recurse
        nest.pop(name);
      }
      results.push(name);
    });
  }

  // tasks: object with keys as task names
  // names: array of task names
export default function (tasks: any, names: any) {
    let results: any[] = []; // the final sequence
    const missing: any[] = []; // missing tasks
    const recursive: any[] = []; // recursive task dependencies

    sequence(tasks, names, results, missing, recursive, []);

    if (missing.length || recursive.length) {
      results = []; // results are incomplete at best, completely wrong at worst, remove them to avoid confusion
    }

    return {
      sequence: results,
      missingTasks: missing,
      recursiveDependencies: recursive,
    };
}