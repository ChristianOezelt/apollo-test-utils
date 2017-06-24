import { omit, keys } from 'lodash';
import { assert } from 'chai';

import gql from 'graphql-tag';

import {
  mockSubscriptionNetworkInterface,
  MockedSubscription,
  mockNetworkInterface,
  MockedResponse,
} from '../src';

describe('MockSubscriptionNetworkInterface', () => {
  const result1 = {
    result: {
      data: {user: {name: 'Dhaivat Pandya'}},
    },
    delay: 50,
  };

  const result2 = {
    result: {
      data: {user: {name: 'Vyacheslav Kim'}},
    },
    delay: 50,
  };

  const result3 = {
    result: {
      data: {user: {name: 'Changping Chen'}},
    },
    delay: 50,
  };

  const result4 = {
    result: {
      data: {user: {name: 'Amanda Liu'}},
    },
    delay: 50,
  };
  let sub1: any;

  beforeEach(() => {

    sub1 = {
      request: {
        query: gql`
          query UserInfo($name: String) {
            user(name: $name) {
              name
            }
          }
        `,
        variables: {
          name: 'Changping Chen',
        },
      },
      id: 0,
      results: [result1, result2, result3, result4],
    };
  });

  it('correctly adds mocked subscriptions', () => {
    const networkInterface = mockSubscriptionNetworkInterface([sub1]);
    const mockedSubscriptionsByKey = networkInterface.mockedSubscriptionsByKey;
    assert.equal(Object.keys(mockedSubscriptionsByKey).length, 1);
    const key = Object.keys(mockedSubscriptionsByKey)[0];
    assert.deepEqual(mockedSubscriptionsByKey[key], [sub1]);
  });

  it('correctly adds multiple mocked subscriptions', () => {
    const networkInterface = mockSubscriptionNetworkInterface([sub1, sub1]);
    const mockedSubscriptionsByKey = networkInterface.mockedSubscriptionsByKey;
    assert.equal(Object.keys(mockedSubscriptionsByKey).length, 1);

    const key = Object.keys(mockedSubscriptionsByKey)[0];
    assert.deepEqual(mockedSubscriptionsByKey[key], [sub1, sub1]);
  });

  it('throws an error when firing a result array is empty', () => {
    const noResultSub = omit(sub1, 'results') as MockedSubscription;

    assert.throw(() => {
      const networkInterface = mockSubscriptionNetworkInterface([noResultSub]);
      networkInterface.subscribe(
        {
          query: gql`
            query UserInfo($name: String) {
              user(name: $name) {
                name
              }
            }
          `,
          variables: {
            name: 'Changping Chen',
          },
        },
        (error, result) => {
          assert.deepEqual(result, result1.result);
        },
      );
      networkInterface.fireResult(0);
    });
  });


  it('throws an error when firing a subscription id that does not exist', () => {
    const noResultSub = omit(sub1, 'results') as MockedSubscription;

    assert.throw(() => {
      const networkInterface = mockSubscriptionNetworkInterface([noResultSub]);
      networkInterface.subscribe(
        {
          query: gql`
            query UserInfo($name: String) {
              user(name: $name) {
                name
              }
            }
          `,
          variables: {
            name: 'Changping Chen',
          },
        },
        (error, result) => {
          assert.deepEqual(result, result1.result);
        },
      );
      networkInterface.fireResult(4);
    });
  });
  it('correctly subscribes', (done) => {
    const networkInterface = mockSubscriptionNetworkInterface([sub1]);
    const id = networkInterface.subscribe(
      {
        query: gql`
          query UserInfo($name: String) {
            user(name: $name) {
              name
            }
          }
        `,
        variables: {
          name: 'Changping Chen',
        },
      },
      (error, result) => {
        assert.deepEqual(result, result1.result);
        done();
      },
    );
    networkInterface.fireResult(0);
    assert.equal(id, 0);
    assert.deepEqual(networkInterface.mockedSubscriptionsById[0], sub1);
  });

  it('correctly fires results', (done) => {
    const networkInterface = mockSubscriptionNetworkInterface([sub1]);
    networkInterface.subscribe(
      {
        query: gql`
          query UserInfo($name: String) {
            user(name: $name) {
              name
            }
          }
        `,
        variables: {
          name: 'Changping Chen',
        },
      },
      (error, result) => {
        assert.deepEqual(result, result1.result);
        done();
      },
    );
    networkInterface.fireResult(0);
  });

  it('correctly fires multiple results', (done) => {
    let allResults: any[] = [];
    const networkInterface = mockSubscriptionNetworkInterface([sub1]);
    networkInterface.subscribe(
      {
        query: gql`
          query UserInfo($name: String) {
            user(name: $name) {
              name
            }
          }
        `,
        variables: {
          name: 'Changping Chen',
        },
      },
      (error, result) => {
        allResults.push(result);
      },
    );

      for (let i = 0; i < 4; i++) {
        networkInterface.fireResult(0);
      }
      setTimeout(() => {
        assert.deepEqual(
          allResults,
          [result1.result, result2.result, result3.result, result4.result],
        );
        done();
      }, 50);


  });

  it('correctly unsubscribes', () => {
    const networkInterface = mockSubscriptionNetworkInterface([sub1]);
    networkInterface.subscribe(
      {
        query: gql`
          query UserInfo($name: String) {
            user(name: $name) {
              name
            }
          }
        `,
        variables: {
          name: 'Changping Chen',
        },
      },
      (error, result) => {
        assert(false);
      },
    );
    networkInterface.unsubscribe(0);
    assert.throw(() => {
      networkInterface.fireResult(0);
    });
  });
});

describe('mockNetworkInterace', () => {
  const query = gql`
      query UserInfo($name: String) {
        user(name: $name) {
          name
        }
      }`;
  it( 'should not add typenames to queries when addTypeName option is false (/undefined)', () => {
    const queryMock: MockedResponse = {
      request: {
        query: query,
        variables: {
          name: 'Edward Elric',
        },
      },
      result: [],
    };
    const mockedNetworkInterface = mockNetworkInterface( queryMock );
    const keysOfMockedResponses = keys(mockedNetworkInterface.mockedResponsesByKey );
    assert.lengthOf( keysOfMockedResponses, 1 );
    assert.notMatch(keysOfMockedResponses[0], /\_\_typename/g );
  });

  it( 'should add typenames to queries when addTypeName option is true', () => {
    const queryMock: MockedResponse = {
      request: {
        query: query,
        variables: {
          name: 'Alphonse Elric',
        },
        addTypeName: true,
      },
      result: [],
    };
    const mockedNetworkInterface = mockNetworkInterface(queryMock);
    const keysOfMockedResponses = keys(mockedNetworkInterface.mockedResponsesByKey);
    assert.lengthOf(keysOfMockedResponses, 1);
    assert.match(keysOfMockedResponses[0], /\_\_typename/g);
  });
});
