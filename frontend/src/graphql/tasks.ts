import gql from 'graphql-tag'

export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      uuid
      title
      description
      milestone
      priority_level
      order_id
      is_done
      is_archived
    }
  }
`

export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      uuid
      title
      description
      milestone
      priority_level
      order_id
      is_done
      is_archived
    }
  }
`

export const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(uuid: $id) {
      message
      status
      success
    }
  }
`

export const GET_TASKS_QUERY = gql`
  query GetTasks($filter: TaskFilterInput, $sort: TaskSortInput) {
    tasks(filter: $filter, sort: $sort) {
      uuid
      title
      description
      milestone
      priority_level
      order_id
      is_done
      is_archived
      total_caracters
    }
  }
`
