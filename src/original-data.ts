import { KanbanBoardState } from "./App/type";

const northstar = {
  statusFieldId: 243,
  status: [
    {
      color: "blue",
      label: "To do",
      value: 1,
      position: 2,
      group: 1,
      active: true,
      deletable: false,
      editable: false,
    },
    {
      color: "green",
      label: "In progress",
      value: 2,
      position: 4,
      group: 2,
      active: true,
      deletable: false,
      editable: false,
    },
    {
      color: "green",
      label: "Completed",
      value: 3,
      position: 8,
      group: 3,
      active: true,
      deletable: false,
      editable: false,
    },
    {
      color: "cool-gray",
      label: "Blocked",
      value: 4,
      position: 9,
      group: 4,
      active: true,
      deletable: false,
      editable: false,
    },
    {
      color: "magenta",
      label: "In Design",
      value: 5,
      position: 3,
      group: 2,
      active: true,
      deletable: true,
      editable: true,
    },
    {
      color: "yellow",
      label: "In Testing",
      value: 7,
      position: 7,
      group: 2,
      active: true,
      deletable: true,
      editable: true,
    },
    {
      color: "red",
      label: "Deferred",
      value: 16,
      position: 10,
      group: 1,
      active: true,
      deletable: true,
      editable: true,
    },
    {
      color: "magenta",
      label: "Suggestion",
      value: 17,
      position: 11,
      group: 1,
      active: true,
      deletable: true,
      editable: true,
    },
    {
      color: "purple",
      label: "Decision_Required",
      value: 18,
      position: 12,
      group: 4,
      active: true,
      deletable: true,
      editable: true,
    },
    {
      color: "red",
      label: "Dev Completed",
      value: 20,
      position: 5,
      group: 3,
      active: true,
      deletable: true,
      editable: true,
    },
    {
      color: "cyan",
      label: "In Review",
      value: 21,
      position: 6,
      group: 2,
      active: true,
      deletable: true,
      editable: true,
    },
    {
      color: "yellow",
      label: "Backlog",
      value: 22,
      position: 1,
      group: 1,
      active: true,
      deletable: true,
      editable: true,
    },
    {
      color: "teal",
      label: "Not RLS",
      value: 23,
      position: 13,
      group: 1,
      active: true,
      deletable: true,
      editable: true,
    },
    {
      color: "teal",
      label: "Dev Complete, UI Pending",
      value: 24,
      position: 14,
      group: 2,
      active: true,
      deletable: true,
      editable: true,
    },
    {
      color: "cyan",
      label: "Deployed to Nitro",
      value: 25,
      position: 15,
      group: 2,
      active: true,
      deletable: true,
      editable: true,
    },
    {
      color: "blue",
      label: "Deployed to Prod",
      value: 26,
      position: 16,
      group: 3,
      active: true,
      deletable: true,
      editable: true,
    },
    {
      color: "gray",
      label: "Expected behaviour",
      value: 27,
      position: 17,
      group: 3,
      active: true,
      deletable: true,
      editable: true,
    },
    {
      color: "green",
      label: "Ready for Dev",
      value: 28,
      position: 18,
      group: 2,
      active: true,
      deletable: true,
      editable: true,
    },
    {
      color: "purple",
      label: "Ready to push",
      value: 29,
      position: 19,
      group: 2,
      active: true,
      deletable: true,
      editable: true,
    },
    {
      color: "blue",
      label: "Internal Testing",
      value: 6,
      position: 4,
      group: 2,
      active: false,
      deletable: true,
      editable: true,
    },
    {
      color: "magenta",
      label: "Design complete",
      value: 5,
      position: 5,
      group: 2,
      active: false,
      deletable: true,
      editable: true,
    },
    {
      color: "red",
      label: "Scope change",
      value: 12,
      position: 6,
      group: 2,
      active: false,
      deletable: true,
      editable: true,
    },
    {
      color: "magenta",
      label: "In Designn",
      value: 5,
      position: 3,
      group: 2,
      active: false,
      deletable: true,
      editable: true,
    },
    {
      color: "magenta",
      label: "Design",
      value: 5,
      position: 3,
      group: 2,
      active: false,
      deletable: true,
      editable: true,
    },
    {
      color: "blue",
      label: "Rejected",
      value: 10,
      position: 7,
      group: 3,
      active: false,
      deletable: true,
      editable: true,
    },
    {
      color: "blue",
      label: "Unable to reproduce",
      value: 11,
      position: 8,
      group: 3,
      active: false,
      deletable: true,
      editable: true,
    },
    {
      color: "blue",
      label: "Duplicate",
      value: 13,
      position: 9,
      group: 3,
      active: false,
      deletable: true,
      editable: true,
    },
    {
      color: "red",
      label: "Retesting",
      value: 8,
      position: 7,
      group: 2,
      active: false,
      deletable: true,
      editable: true,
    },
    {
      color: "blue",
      label: "Deferred",
      value: 9,
      position: 11,
      group: 1,
      active: false,
      deletable: true,
      editable: true,
    },
  ],
  api: `https://northstar.api.nitro.run`,
};

const leadsquared = {
  statusFieldId: 8418,
  status: [
    {
      color: "blue",
      label: "To do",
      value: 1,
      position: 2,
      group: 1,
      active: true,
      deletable: false,
      editable: false,
    },
    {
      color: "green",
      label: "In progress",
      value: 2,
      position: 3,
      group: 2,
      active: true,
      deletable: false,
      editable: false,
    },
    {
      color: "green",
      label: "Completed",
      value: 3,
      position: 7,
      group: 3,
      active: true,
      deletable: false,
      editable: false,
    },
    {
      color: "cool-gray",
      label: "Blocked",
      value: 4,
      position: 6,
      group: 4,
      active: true,
      deletable: false,
      editable: false,
    },
    {
      color: "cyan",
      label: "UAT",
      value: 5,
      position: 4,
      group: 2,
      active: true,
      deletable: true,
      editable: true,
    },
    {
      color: "blue",
      label: "Descoped",
      value: 6,
      position: 5,
      group: 3,
      active: true,
      deletable: true,
      editable: true,
    },
    {
      color: "yellow",
      label: "In-Pipeline",
      value: 7,
      position: 1,
      group: 1,
      active: true,
      deletable: true,
      editable: true,
    },
  ],
  api: `https://leadsquared.api.rocketlane.com`,
};
const { statusFieldId, status, api } = northstar;
const statusLookup = new Map(status.map((s) => [s.value, s]));

enum TaskStatus {
  ToDo = "Todo",
  InProgress = "In progress",
  Completed = "Completed",
  Blocked = "Blocked",
  Proposed = "Proposed",
  InPlanning = "In Planning",
  ToBeStaffed = "To be Staffed",
  Cancelled = "Cancelled",
}
interface Task {
  taskId: number;
  taskName: string;
  taskDescription?: string;
  privateTaskDescription?: string;
  status: TaskStatus;
  project: {
    projectId: number;
    projectName: string;
  };
  fields: { fieldId: number; fieldValue: number; fieldName: string }[];
}

export const computeState = async () => {
  const data: Task[] = await (
    await fetch(`${api}/api/v1/tasks/light`, {
      headers: {
        "api-key": "",
      },
      method: "GET",
      mode: "cors",
      credentials: "omit",
    })
  ).json();
  const { uniqueProjects, uniqueStatus, uniqueProjectDetails } = data.reduce(
    (acc, task) => {
      const projectMap = acc.uniqueProjects.get(task.project.projectId);
      if (!projectMap) {
        acc.uniqueProjects.set(task.project.projectId, [task]);
      } else {
        acc.uniqueProjects.set(
          task.project.projectId,
          projectMap.concat([task])
        );
      }
      if (!acc.uniqueProjectDetails[task.project.projectId]) {
        acc.uniqueProjectDetails[task.project.projectId] = task.project;
      }
      const status = statusLookup.get(
        task.fields.find((field) => field.fieldId === statusFieldId)
          ?.fieldValue!
      )!;
      const statusMap = acc.uniqueStatus.get(status.label);
      if (!statusMap) {
        acc.uniqueStatus.set(status.label, [task]);
      } else {
        acc.uniqueStatus.set(status.label, statusMap.concat([task]));
      }
      return acc;
    },
    {
      uniqueProjects: new Map(),
      uniqueStatus: new Map(),
      uniqueProjectDetails: {},
    } as {
      uniqueProjects: Map<Task["project"]["projectId"], Task[]>;
      uniqueStatus: Map<string, Task[]>;
      uniqueProjectDetails: Record<
        Task["project"]["projectId"],
        Task["project"]
      >;
    }
  );

  const state: KanbanBoardState<Task, Task["project"], string> = {};
  uniqueProjects.forEach((_, project) => {
    state[project] = {
      cols: {},
      count: 0,
      label: uniqueProjectDetails[project].projectName,
      id: project,
      extra: uniqueProjectDetails[project],
    };
    uniqueStatus.forEach((tasks, status) => {
      const taskInProject = tasks.filter(
        (task) => task.project.projectId === project
      );
      state[project].count = taskInProject.length + state[project].count;
      state[project].cols[status] = {
        label: status,
        id: status,
        tasks: taskInProject.map((task) => ({
          id: task.taskId + status + project,
          label: task.taskName,
          extra: task,
          colId: status,
          swimlaneId: project,
        })),
        count: taskInProject.length,
        extra: status,
      };
    });
  });
  return state;
};

// eslint-disable-next-line no-restricted-globals
self.onmessage = (e) => {
  const { action } = e.data;
  if (action === "COMPUTE") {
    const self = e.target as Worker;
    computeState().then((state) => {
      self.postMessage({ state });
    });
    // eslint-disable-next-line no-restricted-globals
  }
};

console.log("test");
