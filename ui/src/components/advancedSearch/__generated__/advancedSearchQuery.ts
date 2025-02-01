/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MediaType } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: advancedSearchQuery
// ====================================================

export interface advancedSearchQuery_advancedSearch_media_thumbnail {
  __typename: "MediaURL";
  /**
   * URL for previewing the image
   */
  url: string;
  /**
   * Width of the image in pixels
   */
  width: number;
  /**
   * Height of the image in pixels
   */
  height: number;
}

export interface advancedSearchQuery_advancedSearch_media_highRes {
  __typename: "MediaURL";
  /**
   * URL for previewing the image
   */
  url: string;
}

export interface advancedSearchQuery_advancedSearch_media_videoWeb {
  __typename: "MediaURL";
  /**
   * URL for previewing the image
   */
  url: string;
}

export interface advancedSearchQuery_advancedSearch_media {
  __typename: "Media";
  id: string;
  type: MediaType;
  /**
   * A short string that can be used to generate a blured version of the media, to show while the original is loading
   */
  blurhash: string | null;
  /**
   * URL to display the media in a smaller resolution
   */
  thumbnail: advancedSearchQuery_advancedSearch_media_thumbnail | null;
  /**
   * URL to display the photo in full resolution, will be null for videos
   */
  highRes: advancedSearchQuery_advancedSearch_media_highRes | null;
  /**
   * URL to get the video in a web format that can be played in the browser, will be null for photos
   */
  videoWeb: advancedSearchQuery_advancedSearch_media_videoWeb | null;
  favorite: boolean;
}

export interface advancedSearchQuery_advancedSearch {
  __typename: "AdvancedSearchResult";
  /**
   * A list of media that matched the query
   */
  media: advancedSearchQuery_advancedSearch_media[];
}

export interface advancedSearchQuery {
  /**
   * Perform an advanced search query on the contents of the media library
   */
  advancedSearch: advancedSearchQuery_advancedSearch;
}

export interface advancedSearchQueryVariables {
  fileNames?: (string | null)[] | null;
  albumIDs?: (number | null)[] | null;
  startDate?: Time | null;
  endDate?: Time | null;
}
