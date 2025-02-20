'use strict';

const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script();
const { expect } = Code;
const Server = require('../../server');
const { getAdminAuthHeader, getUserAuthHeader } = require('../helpers/auth');

describe('Movie Routes', () => {

    let server;
    let createdMovieId;

    beforeEach(async () => {

        server = await Server.deployment();

        // Create a test movie that we can use for GET and PUT tests
        const createResponse = await server.inject({
            method: 'post',
            url: '/movie',
            payload: {
                title: 'Test Movie',
                description: 'Test Description that is long enough',
                releaseDate: '2023-01-01',
                director: 'Test Director'
            },
            headers: getAdminAuthHeader()
        });

        const result = JSON.parse(createResponse.payload);
        createdMovieId = result.id;
    });

    afterEach(async () => {
        // Clean up the test movie if it exists
        if (createdMovieId) {
            await server.inject({
                method: 'delete',
                url: `/movie/${createdMovieId}`,
                headers: getAdminAuthHeader()
            });
        }
    });

    describe('POST /movie', () => {

        it('creates a new movie', async () => {

            const response = await server.inject({
                method: 'post',
                url: '/movie',
                payload: {
                    title: 'Test Movie',
                    description: 'Test Description that is long enough',
                    releaseDate: '2023-01-01',
                    director: 'Test Director'
                },
                headers: getAdminAuthHeader()
            });

            expect(response.statusCode).to.equal(200);
            const result = JSON.parse(response.payload);
            expect(result).to.include(['title', 'description', 'director']);
        });

        it('fails with invalid payload', async () => {

            const response = await server.inject({
                method: 'post',
                url: '/movie',
                payload: {
                    title: 'Test',
                    description: 'Too short'
                },
                headers: getAdminAuthHeader()
            });

            expect(response.statusCode).to.equal(400);
        });
    });

    describe('GET /movies', () => {

        it('returns list of movies', async () => {

            const response = await server.inject({
                method: 'get',
                url: '/movies',
                headers: getUserAuthHeader()
            });

            expect(response.statusCode).to.equal(200);
            expect(JSON.parse(response.payload)).to.be.an.array();
        });
    });

    describe('PATCH /movie/{id}', () => {

        it('updates a movie', async () => {

            const response = await server.inject({
                method: 'patch',
                url: `/movie/${createdMovieId}`,
                payload: {
                    title: 'Updated Movie Title',
                    description: 'Test Description that is long enough',
                    releaseDate: '2023-01-01',
                    director: 'Test Director'
                },
                headers: getAdminAuthHeader()
            });

            expect(response.statusCode).to.equal(200);
            const result = JSON.parse(response.payload);
            expect(result.title).to.equal('Updated Movie Title');
        });

        it('returns 404 for non-existent movie', async () => {

            const response = await server.inject({
                method: 'patch',
                url: '/movie/999999',
                payload: {
                    title: 'Updated Movie Title'
                },
                headers: getAdminAuthHeader()
            });

            expect(response.statusCode).to.equal(404);
        });

        it('fails with invalid payload', async () => {

            const response = await server.inject({
                method: 'patch',
                url: `/movie/${createdMovieId}`,
                payload: {
                    title: '' // invalid empty title
                },
                headers: getAdminAuthHeader()
            });

            expect(response.statusCode).to.equal(400);
        });
    });

    describe('GET /movie/{id}', () => {

        it('returns a specific movie', async () => {

            const response = await server.inject({
                method: 'get',
                url: `/movie/${createdMovieId}`,
                headers: getUserAuthHeader()
            });

            expect(response.statusCode).to.equal(200);
            const result = JSON.parse(response.payload);
            expect(result.id).to.equal(createdMovieId);
        });

        it('returns 404 for non-existent movie', async () => {

            const response = await server.inject({
                method: 'get',
                url: '/movie/999999',
                headers: getUserAuthHeader()
            });

            expect(response.statusCode).to.equal(404);
        });
    });

    describe('DELETE /movie/{id}', () => {

        it('deletes a movie', async () => {
            // D'abord créer un film
            const createResponse = await server.inject({
                method: 'post',
                url: '/movie',
                payload: {
                    title: 'Delete Test Movie',
                    description: 'Test Description that is long enough',
                    releaseDate: '2023-01-01',
                    director: 'Test Director'
                },
                headers: getAdminAuthHeader()
            });

            const movie = JSON.parse(createResponse.payload);

            const response = await server.inject({
                method: 'delete',
                url: `/movie/${movie.id}`,
                headers: getAdminAuthHeader()
            });

            expect(response.statusCode).to.equal(204);

            // Vérifier que le film a bien été supprimé
            const getResponse = await server.inject({
                method: 'get',
                url: `/movie/${movie.id}`,
                headers: getUserAuthHeader()
            });

            expect(getResponse.statusCode).to.equal(404);
        });
    });

    describe('POST /movies/export', () => {

        it('initiates movie export for admin', async () => {

            const response = await server.inject({
                method: 'post',
                url: '/movies/export',
                headers: getAdminAuthHeader()
            });

            expect(response.statusCode).to.equal(200);
            const result = JSON.parse(response.payload);
            expect(result.message).to.equal('Export started. You will receive an email shortly.');
        });

        it('fails for non-admin users', async () => {

            const response = await server.inject({
                method: 'post',
                url: '/movies/export',
                headers: getUserAuthHeader()
            });

            expect(response.statusCode).to.equal(403);
        });
    });

    describe('DELETE /movies/favorites/{movieId}', () => {

        it('fails with non-existent favorite', async () => {

            const response = await server.inject({
                method: 'delete',
                url: '/movies/favorites/999999',
                headers: getUserAuthHeader()
            });

            expect(response.statusCode).to.equal(404);
        });
    });

});
