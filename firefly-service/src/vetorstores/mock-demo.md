分析以下代码生成mock数据：

// api.ts

import {  useGetOne } from "./request";

const projectResource = '/projects';
export interface Project {
    id: number;
    name: string;
    time: string;
    description?: string;
}

export const useGetProjectDetail = (id: string) => {
    return useGetOne<Project>(
        "ProjectDetail",
        projectResource,
        id,
    );
}


// mock.ts
import { MockMethod } from 'vite-plugin-mock';

const mockProjects = {
  total: 200,
  list: [
    {
      id: 1,
      name: 'Project1',
      description: 'description',
    },
    {
      id: 2,
      name: 'Project2',
      description: 'description',
    },
  ]
}

export default [
  {
    url: '/api/v1/projectDetail',
    method: 'get',
    response: ({ query }) => {
      return mockProjects;
    },
  },
] as MockMethod[];