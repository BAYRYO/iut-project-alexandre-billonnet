'use strict';

const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

const Favorite = require('../../lib/models/favorite');

describe('Favorite Model', () => {

    it('validates tableName', () => {

        expect(Favorite.tableName).to.equal('favorite');
    });

    describe('relationMappings', () => {

        const relations = Favorite.relationMappings;

        it('defines user relation', () => {

            expect(relations.user).to.exist();
            expect(relations.user.relation.name).to.equal('BelongsToOneRelation');
            expect(relations.user.join.from).to.equal('favorite.userId');
            expect(relations.user.join.to).to.equal('user.id');
        });

        it('defines movie relation', () => {

            expect(relations.movie).to.exist();
            expect(relations.movie.relation.name).to.equal('BelongsToOneRelation');
            expect(relations.movie.join.from).to.equal('favorite.movieId');
            expect(relations.movie.join.to).to.equal('movie.id');
        });
    });

    describe('joiSchema', () => {

        const schema = Favorite.joiSchema;

        it('validates a valid favorite', () => {

            const favorite = {
                id: 1,
                userId: 1,
                movieId: 1,
                createdAt: new Date()
            };

            const { error } = schema.validate(favorite);
            expect(error).to.not.exist();
        });

        it('requires userId', () => {

            const favorite = {
                movieId: 1
            };

            const { error } = schema.validate(favorite);
            expect(error).to.exist();
            expect(error.details[0].message).to.contain('"userId" is required');
        });

        it('requires movieId', () => {

            const favorite = {
                userId: 1
            };

            const { error } = schema.validate(favorite);
            expect(error).to.exist();
            expect(error.details[0].message).to.contain('"movieId" is required');
        });

        it('validates id must be positive integer', () => {

            const favorite = {
                id: -1,
                userId: 1,
                movieId: 1
            };

            const { error } = schema.validate(favorite);
            expect(error).to.exist();
            expect(error.details[0].message).to.contain('must be greater than 0');
        });

        it('validates userId must be positive integer', () => {

            const favorite = {
                userId: -1,
                movieId: 1
            };

            const { error } = schema.validate(favorite);
            expect(error).to.exist();
            expect(error.details[0].message).to.contain('must be greater than 0');
        });

        it('validates movieId must be positive integer', () => {

            const favorite = {
                userId: 1,
                movieId: -1
            };

            const { error } = schema.validate(favorite);
            expect(error).to.exist();
            expect(error.details[0].message).to.contain('must be greater than 0');
        });

        it('validates createdAt must be a date', () => {

            const favorite = {
                userId: 1,
                movieId: 1,
                createdAt: 'not-a-date'
            };

            const { error } = schema.validate(favorite);
            expect(error).to.exist();
            expect(error.details[0].message).to.contain('"createdAt" must be a valid date');
        });
    });

    describe('$beforeInsert', () => {

        it('sets createdAt to current date', () => {

            const favorite = new Favorite();
            favorite.$beforeInsert();

            expect(favorite.createdAt).to.be.instanceOf(Date);
        });
    });
});
