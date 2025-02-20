'use strict';

const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const Boom = require('@hapi/boom');

const { describe, it, beforeEach } = exports.lab = Lab.script();
const { expect } = Code;
const Server = require('../../server');

describe('Movie Service', () => {

    let server;
    let movieService;

    beforeEach(async () => {

        server = await Server.deployment();
        movieService = server.services().movieService;
    });

    describe('create()', () => {

        it('creates a new movie', async () => {

            const movieData = {
                title: 'Test Movie',
                description: 'Test Description that is long enough',
                releaseDate: new Date('2023-01-01'),
                director: 'Test Director'
            };

            const result = await movieService.create(movieData);

            expect(result).to.be.an.object();
            expect(result.title).to.equal(movieData.title);
            expect(result.description).to.equal(movieData.description);
            expect(result.director).to.equal(movieData.director);
        });
    });

    describe('list()', () => {

        it('returns an array of movies', async () => {

            const result = await movieService.list();

            expect(result).to.be.an.array();
        });
    });

    describe('get()', () => {

        it('returns a specific movie by id', async () => {

            const movie = await movieService.create({
                title: 'Get Test Movie',
                description: 'Test Description that is long enough',
                releaseDate: new Date('2023-01-01'),
                director: 'Test Director'
            });

            const result = await movieService.get(movie.id);
            expect(result).to.be.an.object();
            expect(result.id).to.equal(movie.id);
        });
    });

    describe('update()', () => {

        it('updates an existing movie', async () => {

            const movie = await movieService.create({
                title: 'Original Title',
                description: 'Original description that is long enough',
                releaseDate: new Date('2023-01-01'),
                director: 'Original Director'
            });

            const updateData = {
                title: 'Updated Title'
            };

            const result = await movieService.update(movie.id, updateData);
            expect(result.id).to.equal(movie.id);
            expect(result.title).to.equal(updateData.title);
        });

        it('throws not found error for non-existent movie', async () => {

            try {
                await movieService.update(99999, { title: 'New Title' });
                expect.fail('Should throw not found error');
            }
            catch (err) {
                expect(err).to.be.an.error(Boom.notFound('Movie not found').message);
            }
        });
    });

    describe('delete()', () => {

        it('returns null when deleting non-existent movie', async () => {

            const result = await movieService.delete(99999);
            expect(result).to.be.null();
        });
    });

    describe('addToFavorites()', () => {

        it('adds a movie to user favorites', async () => {

            const { userService } = server.services();

            // Create test user and movie
            const user = await userService.create({
                firstName: 'Test',
                lastName: 'User',
                password: 'password123',
                mail: 'test.favorites@test.com',
                username: 'testfavorites'
            });

            const movie = await movieService.create({
                title: 'Favorite Test Movie',
                description: 'Test Description that is long enough',
                releaseDate: new Date('2023-01-01'),
                director: 'Test Director'
            });

            const result = await movieService.addToFavorites(user.id, movie.id);
            expect(result.success).to.be.true();
        });

        it('throws conflict error for duplicate favorite', async () => {

            const { userService } = server.services();

            const user = await userService.create({
                firstName: 'Test',
                lastName: 'User',
                password: 'password123',
                mail: 'test.duplicate@test.com',
                username: 'testduplicate'
            });

            const movie = await movieService.create({
                title: 'Duplicate Favorite Test',
                description: 'Test Description that is long enough',
                releaseDate: new Date('2023-01-01'),
                director: 'Test Director'
            });

            await movieService.addToFavorites(user.id, movie.id);

            try {
                await movieService.addToFavorites(user.id, movie.id);
                expect.fail('Should throw conflict error');
            }
            catch (err) {
                expect(err).to.be.an.error(Boom.conflict('Movie already in favorites').message);
            }
        });
    });

    describe('removeFromFavorites()', () => {

        it('removes a movie from user favorites', async () => {

            const { userService } = server.services();

            const user = await userService.create({
                firstName: 'Test',
                lastName: 'User',
                password: 'password123',
                mail: 'test.remove@test.com',
                username: 'testremove'
            });

            const movie = await movieService.create({
                title: 'Remove Favorite Test',
                description: 'Test Description that is long enough',
                releaseDate: new Date('2023-01-01'),
                director: 'Test Director'
            });

            await movieService.addToFavorites(user.id, movie.id);
            const result = await movieService.removeFromFavorites(user.id, movie.id);
            expect(result.success).to.be.true();
        });

        it('throws not found error for non-existent favorite', async () => {

            try {
                await movieService.removeFromFavorites(99999, 99999);
                expect.fail('Should throw not found error');
            }
            catch (err) {
                expect(err).to.be.an.error(Boom.notFound('Movie not in favorites').message);
            }
        });
    });

    describe('listFavorites()', () => {

        it('throws not found error for non-existent user', async () => {

            try {
                await movieService.listFavorites(99999);
                expect.fail('Should throw not found error');
            }
            catch (err) {
                expect(err).to.be.an.error(Boom.notFound('User not found').message);
            }
        });
    });

    describe('exportMoviesToCsv()', () => {

        it('generates CSV and triggers email', async () => {

            const result = await movieService.exportMoviesToCsv('test@example.com');
            expect(result.success).to.be.true();
        });
    });

    describe('generateCsv()', () => {

        it('generates CSV content from movies array', async () => {

            const movies = [{
                id: 1,
                title: 'Test Movie',
                description: 'Description',
                releaseDate: new Date('2023-01-01'),
                director: 'Director',
                createdAt: new Date(),
                updatedAt: new Date()
            }];

            const csv = await movieService.generateCsv(movies);
            expect(csv).to.be.a.string();
            expect(csv).to.include('ID,Titre,Description');
            expect(csv).to.include('Test Movie');
        });
    });
});
