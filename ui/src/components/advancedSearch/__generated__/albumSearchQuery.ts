/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: albumSearchQuery
// ====================================================

export interface albumSearchQuery_search_albums_thumbnail_thumbnail {
  __typename: "MediaURL";
  /**
   * URL for previewing the image
   */
  url: string;
}

export interface albumSearchQuery_search_albums_thumbnail {
  __typename: "Media";
  /**
   * URL to display the media in a smaller resolution
   */
  thumbnail: albumSearchQuery_search_albums_thumbnail_thumbnail | null;
}

export interface albumSearchQuery_search_albums {
  __typename: "Album";
  id: string;
  title: string;
  /**
   * An image in this album used for previewing this album
   */
  thumbnail: albumSearchQuery_search_albums_thumbnail | null;
}

export interface albumSearchQuery_search {
  __typename: "SearchResult";
  /**
   * The string that was searched for
   */
  query: string;
  /**
   * A list of albums that matched the query
   */
  albums: albumSearchQuery_search_albums[];
}

export interface albumSearchQuery {
  /**
   * Perform a search query on the contents of the media library
   */
  search: albumSearchQuery_search;
}

export interface albumSearchQueryVariables {
  query: string;
}
