'use strict';

const { Service } = require('@hapipal/schmervice');
const { stringify } = require('csv-stringify');
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

    async update(id, movie) {

        const { Movie } = this.server.models();

        const existingMovie = await Movie.query().findById(id);

        if (!existingMovie) {
            throw Boom.notFound('Movie not found');
        }

        return Movie.query().patchAndFetchById(id, movie);
    }

    async delete(id) {

        const { Movie } = this.server.models();

        const movie = await Movie.query().findById(id);
        if (!movie) {
            return null;
        }

        await Movie.query().deleteById(id);
        return null; // Explicitly return null
    }

    async addToFavorites(userId, movieId) {

        const { Favorite, Movie, User } = this.server.models();

        try {
            // Vérifier si l'utilisateur existe
            const user = await User.query().findById(userId);
            if (!user) {
                throw Boom.notFound('User not found');
            }

            // Vérifier si le film existe
            const movie = await Movie.query().findById(movieId);
            if (!movie) {
                throw Boom.notFound('Movie not found');
            }

            // Vérifier si le favori existe déjà
            const existing = await Favorite.query()
                .where('userId', userId)
                .where('movieId', movieId)
                .first();

            if (existing) {
                throw Boom.conflict('Movie already in favorites');
            }

            // Ajouter le favori
            await Favorite.query().insert({
                userId,
                movieId
            });

            return { success: true };
        }
        catch (error) {
            if (error.isBoom) {
                throw error;
            }

            throw Boom.internal('Failed to add favorite');
        }
    }

    async removeFromFavorites(userId, movieId) {

        const { Favorite } = this.server.models();

        try {
            const deleted = await Favorite.query()
                .where('userId', userId)
                .where('movieId', movieId)
                .delete();

            if (!deleted) {
                throw Boom.notFound('Movie not in favorites');
            }

            return { success: true };
        }
        catch (error) {
            if (error.isBoom) {
                throw error;
            }

            throw Boom.internal('Failed to remove favorite');
        }
    }

    async listFavorites(userId) {

        const { User, Movie } = this.server.models();

        try {
            const user = await User.query().findById(userId);
            if (!user) {
                throw Boom.notFound('User not found');
            }

            const favorites = await Movie.query()
                .joinRelated('favorites')
                .where('favorites.userId', userId)
                .select('movie.*');

            return favorites;
        }
        catch (error) {
            if (error.isBoom) {
                throw error;
            }

            throw Boom.internal('Failed to list favorites');
        }
    }

    async exportMoviesToCsv(userEmail) {

        const { mailService } = this.server.services();

        const movies = await this.list();
        const csvContent = await this.generateCsv(movies);
        await mailService.sendCsvExport(userEmail, csvContent);

        return { success: true };
    }

    generateCsv(movies) {

        const columns = {
            id: 'ID',
            title: 'Titre',
            description: 'Description',
            releaseDate: 'Date de sortie',
            director: 'Réalisateur',
            createdAt: 'Date de création',
            updatedAt: 'Dernière modification'
        };

        return new Promise((resolve, reject) => {

            stringify(movies, {
                header: true,
                columns
            }, (err, output) => {

                if (err) {
                    reject(err);
                }

                resolve(output);
            });
        });
    }
};
