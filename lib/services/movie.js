'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');

module.exports = class MovieService extends Service {

    create(movie) {

        const { Movie } = this.server.models();
        return Movie.query().insertAndFetch(movie);
    }

    list() {

        const { Movie } = this.server.models();
        return Movie.query();
    }

    get(id) {

        const { Movie } = this.server.models();
        return Movie.query().findById(id);
    }

    update(id, movie) {

        const { Movie } = this.server.models();
        return Movie.query().patchAndFetchById(id, movie);
    }

    delete(id) {

        const { Movie } = this.server.models();
        return Movie.query().deleteById(id);
    }

    async addToFavorites(userId, movieId) {

        const { Favorite, Movie } = this.server.models();

        const movie = await Movie.query().findById(movieId);
        if (!movie) {
            throw Boom.notFound('Movie not found');
        }

        const existing = await Favorite.query()
            .where({ userId, movieId })
            .first();

        if (existing) {
            throw Boom.conflict('Movie already in favorites');
        }

        return Favorite.query().insert({ userId, movieId });
    }

    async removeFromFavorites(userId, movieId) {

        const { Favorite } = this.server.models();

        const deleted = await Favorite.query()
            .where({ userId, movieId })
            .delete();

        if (!deleted) {
            throw Boom.notFound('Movie not in favorites');
        }

        return { success: true };
    }

    listFavorites(userId) {

        if (!userId) {
            throw Boom.badRequest('User ID is required');
        }

        const { Movie } = this.server.models();

        return Movie.query()
            .select('movie.*')
            .join('favorite', 'movie.id', 'favorite.movieId')
            .where('favorite.userId', userId);
    }
};
