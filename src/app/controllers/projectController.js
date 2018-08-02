import express from 'express'
import sanitize from 'mongo-sanitize'

import authMiddleware from './../middlewares/auth'

import Project from '../models/Project'
import Task from '../models/Task'

const router = express.Router()

router.use(authMiddleware)

router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().populate(['user', 'tasks'])

        return res.json({ projects })
    } catch (error) {
        res.status(400)
           .json({
               error: 'Erro ao listar Projetos!',
               msg: error
           })
    }
})

router.get('/:projectId', async (req, res) => {
    try {
        const id = sanitize(req.params.projectId)

        const project = await Project.findById(id).populate('user')

        return res.json({ project })
    } catch (error) {
        res.status(400)
           .json({
               error: 'Erro ao listar Projeto!',
               msg: error
           })
    }
})

router.post('/', async (req, res) => {
    try {

        const { title, description, tasks } = req.body

        const project = await Project.create({ title, description, user: req.userId })

        await Promise.all(tasks.map(async task => {
            task.project = project._id

            const projectTask = new Task(task)

            await projectTask.save()

            project.tasks.push(projectTask)
        }))

        await project.save()

        return res.json({
            mensagem: 'Projeto criado com sucesso!',
            obj: project
        })
    } catch (error) {
        res.status(400)
           .json({
               error: 'Erro ao criar Projeto!',
               msg: error
           })
    }
})

router.put('/:projectId', async (req, res) => {
    try {
        const { title, description, tasks } = req.body
        const id = sanitize(req.params.projectId)

        const project = await Project.findByIdAndUpdate(id, {
            title,
            description
        }, {
            new: true
        })

        project.tasks = []
        await Task.remove({ project: project._id })

        await Promise.all(tasks.map(async task => {
            task.project = project._id

            const projectTask = new Task(task)

            await projectTask.save()

            project.tasks.push(projectTask)
        }))

        await project.save()

        return res.json({ project })
    } catch (error) {
        res.status(400)
           .json({
               error: 'Erro ao listar Projeto!',
               msg: error
           })
    }
})

router.delete('/:projectId', async (req, res) => {
    try {
        const id = sanitize(req.params.projectId)

        await Project.findByIdAndRemove(id)

        return res.json({ mensagem: 'Projeto deletado com sucesso!' })
    } catch (error) {
        res.status(400)
           .json({
               error: 'Erro ao deletar Projeto!',
               msg: error
           })
    }
})

module.exports = app => app.use('/projects', router)