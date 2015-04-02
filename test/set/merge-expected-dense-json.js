// directly:
[ { json: [ 'movies', 'django-unchained' ] },
  { json: 
     { 'pulp-fiction': 
        { title: 'Pulp Fiction',
          director: 'Quentin Tarantino',
          genres: [ 'Crime', 'Drama', 'Thriller' ],
          summary: { title: 'Pulp Fiction', url: '/movies/id/pulp-fiction' } },
       'kill-bill-1': 
        { title: 'Kill Bill: Vol. 1',
          director: 'Quentin Tarantino',
          genres: [ 'Crime', 'Drama', 'Thriller' ],
          summary: { title: 'Kill Bill: Vol. 1', url: '/movies/id/kill-bill-1' } },
       'reservior-dogs': 
        { title: 'Reservior Dogs',
          director: 'Quentin Tarantino',
          genres: [ 'Crime', 'Drama', 'Thriller' ],
          summary: { title: 'Reservior Dogs', url: '/movies/id/reservior-dogs' } } } } ]

// through references:
[ { json: 
     { '0': 
        { '0': 
           { title: 'Pulp Fiction',
             director: 'Quentin Tarantino',
             genres: [ 'Crime', 'Drama', 'Thriller' ],
             summary: { title: 'Pulp Fiction', url: '/movies/id/pulp-fiction' } },
          '1': 
           { title: 'Kill Bill: Vol. 1',
             director: 'Quentin Tarantino',
             genres: [ 'Crime', 'Drama', 'Thriller' ],
             summary: { title: 'Kill Bill: Vol. 1', url: '/movies/id/kill-bill-1' } },
          '2': 
           { title: 'Reservior Dogs',
             director: 'Quentin Tarantino',
             genres: [ 'Crime', 'Drama', 'Thriller' ],
             summary: { title: 'Reservior Dogs', url: '/movies/id/reservior-dogs' } },
          '3': 
           { title: 'Django Unchained',
             director: 'Quentin Tarantino',
             genres: [ 'Western' ],
             summary: 
              { title: 'Django Unchained',
                url: '/movies/id/django-unchained' } } },
       '1': 
        { '0': 
           { title: 'Pulp Fiction',
             director: 'Quentin Tarantino',
             genres: [ 'Crime', 'Drama', 'Thriller' ],
             summary: { title: 'Pulp Fiction', url: '/movies/id/pulp-fiction' } },
          '1': 
           { title: 'Kill Bill: Vol. 1',
             director: 'Quentin Tarantino',
             genres: [ 'Crime', 'Drama', 'Thriller' ],
             summary: { title: 'Kill Bill: Vol. 1', url: '/movies/id/kill-bill-1' } },
          '2': 
           { title: 'Reservior Dogs',
             director: 'Quentin Tarantino',
             genres: [ 'Crime', 'Drama', 'Thriller' ],
             summary: { title: 'Reservior Dogs', url: '/movies/id/reservior-dogs' } },
          '3': 
           { title: 'Django Unchained',
             director: 'Quentin Tarantino',
             genres: [ 'Western' ],
             summary: 
              { title: 'Django Unchained',
                url: '/movies/id/django-unchained' } } } } } ]