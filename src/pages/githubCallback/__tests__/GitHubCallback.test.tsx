import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { Route, Routes, StaticRouter } from 'react-router';
import { Mock, vi } from 'vitest';

import Constants from '../../../commons/utils/Constants';
import { exchangeAccessCode } from '../../../features/github/GitHubUtils';
import GitHubCallback from '../GitHubCallback';

function renderWithLocation(element: JSX.Element, location: string) {
  return render(
    <StaticRouter location={location}>
      <Routes>
        <Route path={urlWithoutCode} element={element} />
      </Routes>
    </StaticRouter>
  );
}

vi.mock('../../../features/github/GitHubUtils', () => ({
  exchangeAccessCode: vi.fn()
}));

describe('empty client ID', () => {
  beforeAll(() => {
    Constants.githubClientId = '';
    Constants.githubOAuthProxyUrl = 'https://github.com';
  });

  test('Application Client ID not deployed renders correctly', async () => {
    const exchangeAccessCodeMock = exchangeAccessCode as Mock<typeof exchangeAccessCode>;
    exchangeAccessCodeMock.mockImplementation(connectBackendSimulateSuccess);

    act(() => {
      renderWithLocation(<GitHubCallback />, urlWithCode);
    });

    expect(exchangeAccessCodeMock).toBeCalledTimes(0);

    await screen.findByText(
      'Client ID not included with deployment. Please try again or contact the website administrator.'
    );
  });
});

describe('nonempty client ID', () => {
  beforeAll(() => {
    Constants.githubClientId = '123';
    Constants.githubOAuthProxyUrl = 'https://github.com';
  });

  test('Access code not found in return url renders correctly', async () => {
    const exchangeAccessCodeMock = exchangeAccessCode as Mock<typeof exchangeAccessCode>;
    exchangeAccessCodeMock.mockImplementation(connectBackendSimulateSuccess);

    act(() => {
      renderWithLocation(<GitHubCallback />, urlWithoutCode);
    });

    expect(exchangeAccessCodeMock).toBeCalledTimes(0);

    await screen.findByText(
      'Access code not found in callback URL. Please try again or contact the website administrator.'
    );

    exchangeAccessCodeMock.mockRestore();
  });

  test('Cannot connect to server renders correctly', async () => {
    const exchangeAccessCodeMock = exchangeAccessCode as Mock<typeof exchangeAccessCode>;
    exchangeAccessCodeMock.mockImplementation(connectBackendSimulateFailure);

    act(() => {
      renderWithLocation(<GitHubCallback />, urlWithCode);
    });
    expect(exchangeAccessCodeMock).toBeCalledTimes(1);

    await screen.findByText(
      'Connection with server was denied, or incorrect payload received. Please try again or contact the website administrator.'
    );
    exchangeAccessCodeMock.mockRestore();
  });

  test('Successful retrieval of calls correctly', async () => {
    const exchangeAccessCodeMock = exchangeAccessCode as Mock<typeof exchangeAccessCode>;
    exchangeAccessCodeMock.mockImplementation(connectBackendSimulateSuccess);

    const closeWindowMock = vi.spyOn(window, 'close');
    closeWindowMock.mockImplementation(() => {});

    act(() => {
      renderWithLocation(<GitHubCallback />, urlWithCode);
    });

    expect(exchangeAccessCodeMock).toBeCalledTimes(1);

    exchangeAccessCodeMock.mockRestore();
    closeWindowMock.mockRestore();
  });
});

const urlWithCode = '/callback/github?code=12345';
const urlWithoutCode = '/callback/github';

async function connectBackendSimulateSuccess(): Promise<Response> {
  return new Promise(resolve => {
    resolve(new Response(JSON.stringify({ access_token: 12345 })));
  });
}

async function connectBackendSimulateFailure(): Promise<Response> {
  return new Promise(resolve => {
    resolve(new Response());
  });
}
