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
    url: '/api/v1/projects',
    method: 'get',
    response: ({ query }) => {
      return mockProjects;
    },
  },
  {
    url: '/api/v1/projects',
    method: 'post',
    response: ({ body }) => {
      let project = body;
      project.id = 1;
        project.id = 1;
      if (mockProjects.list.length > 0) {
        const max = mockProjects.list.reduce(function (p, v) {
          return (p.id > v.id ? p : v);
        });
        if (max) {
          project.id = max.id + 1;
        }
      }

      mockProjects.list.push(project);
      return project;
    },
  },
  {
    url: '/api/v1/projects',
    method: 'patch',
    response: ({ body }) => {
      let project = body;
      if (mockProjects.list) {
        const index = mockProjects.list.findIndex((item) => {
          return item.id === project.id;

        });
        if (index !== -1 && mockProjects.list) {
          mockProjects.list[index] = project;
        }
      }
      return project;
    },
  },
  {
    url: '/api/v1/projects:batchDelete',
    method: 'post',
    response: ({ body }) => {
      let idList = body.idList;
      if (mockProjects.list) {
        idList.forEach((id) => {
          const index = mockProjects.list.findIndex((item) => {
            return item.id === id;

          });
          if (index > -1) {
            mockProjects.list.splice(index, 1);
          }
        })
      }

      return {};
    },
  },
] as MockMethod[];