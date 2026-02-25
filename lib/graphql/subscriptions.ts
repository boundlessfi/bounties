import { gql } from 'graphql-tag';

/**
 * GraphQL Subscription Documents for real-time bounty events.
 */

export const BOUNTY_CREATED_SUBSCRIPTION = gql`
  subscription BountyCreated {
    bountyCreated {
      id
      title
      status
      rewardAmount
      rewardCurrency
    }
  }
`;

export const BOUNTY_UPDATED_SUBSCRIPTION = gql`
  subscription BountyUpdated {
    bountyUpdated {
      id
      title
      status
      rewardAmount
      rewardCurrency
    }
  }
`;

export const BOUNTY_DELETED_SUBSCRIPTION = gql`
  subscription BountyDeleted {
    bountyDeleted {
      id
    }
  }
`;

/**
 * Type definitions for subscription response data.
 * These ensure strict typing throughout the sync layer.
 */

export interface BountyCreatedData {
    bountyCreated: {
        id: string;
        title: string;
        status: string;
        rewardAmount: number;
        rewardCurrency: string;
    };
}

export interface BountyUpdatedData {
    bountyUpdated: {
        id: string;
        title: string;
        status: string;
        rewardAmount: number;
        rewardCurrency: string;
    };
}

export interface BountyDeletedData {
    bountyDeleted: {
        id: string;
    };
}
