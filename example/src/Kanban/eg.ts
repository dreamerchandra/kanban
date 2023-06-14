interface FetchLayout {
  rowId: number;
  rowLabel: string;
  columnData: {
    [key: string]: {
      innerTaskCount: number;
      colLabel: string;
    };
  };
  totalTaskCount: number;
}

type FetchLayoutResponse = FetchLayout[]

export interface ApiTask {
  taskId: number;
  taskName: string;
  project: {
    projectName: string;
    projectId: number;
  };
}

interface FetchColumnsResponse {
  rowId: number;
  rowLabel: string;
  columnData: {
    [key: string]: {
      colLabel: string;
      tasks: ApiTask[];
      innerTaskCount: number;
    };
  }
  totalTaskCount: 3;
}

interface FetchSwimlane {
  rowId: number;
  rowLabel: string;
  columnData: {
    [key: string]: {
      colLabel: string;
      tasks: ApiTask[];
      innerTaskCount: number;
    };
  };
  totalTaskCount: 10;
}

type FetchSwimlanesResponse = FetchSwimlane[]
const apiKey = "87f8a134-4788-4ae8-80f7-91beafd66fd0";
const api = `https://asim.api.nitro.run`;
const rowGroup = "project";
const columnGroup = "status";

export const fetchLayout = (): Promise<FetchLayoutResponse> => fetch(`${api}/api/v1/tasks/getlightkanbanCount?rowGroup=${rowGroup}&columnGroup=${columnGroup}`, {
  headers: {
    accept: 'application/json, text/plain, */*',
    'api-key': apiKey
  },
  referrerPolicy: 'same-origin',
  method: 'GET',
  mode: 'cors'
}).then((res) => res.json())

export const fetchSwimlanes = ({ swimlaneIds }): Promise<FetchSwimlanesResponse> =>
  fetch(
    `${api}/api/v1/tasks/getlightkanbanV1?rowIds=${swimlaneIds.join(',')}&rowGroup=${rowGroup}&columnGroup=${columnGroup}`,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "api-key": apiKey,
      },
      referrerPolicy: "same-origin",
      method: "GET",
      mode: "cors",
    }
  ).then((res) => res.json());

export const fetchColumns = ({
  offsetCol,
  rowId,
  colId,
}): Promise<FetchColumnsResponse> =>
  fetch(
    `${api}/api/v1/tasks/getlightkanbanColV1?offsetCol=${offsetCol}&limitCol=10&rowId=${rowId}&colId=${colId}&rowGroup=${rowGroup}&columnGroup=${columnGroup}`,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "api-key": apiKey,
      },
      referrerPolicy: "same-origin",
      method: "GET",
      mode: "cors",
    }
  ).then((res) => res.json());


type getRowAndColForTaskIdResponse = {
  rowId: number;
  rowLabel: string;
  columnData: Record<string, {
    colLabel: string;
   }>
}[];


export const getRowAndColumnForTaskId = ({ taskId }): Promise<getRowAndColForTaskIdResponse> => fetch(`${api}/api/v1/tasks/getRowAndColForTaskId?taskId=${taskId}&rowGroup=${rowGroup}&columnGroup=${columnGroup}`, {
  headers: {
    accept: 'application/json, text/plain, */*',
    'api-key': apiKey
  },
  referrerPolicy: 'same-origin',
  method: 'GET',
  mode: 'cors'
}).then((res) => res.json())
