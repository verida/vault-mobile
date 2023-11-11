package io.verida.vault;

import com.facebook.react.modules.network.OkHttpClientFactory;
import com.facebook.react.modules.network.ReactCookieJarContainer;

import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import okhttp3.ConnectionPool;
import okhttp3.Dispatcher;
import okhttp3.OkHttpClient;

class CustomNetworkModule implements OkHttpClientFactory {
    static final int MAX_REQUEST_NUMBER_PER_HOST = 64;

    public OkHttpClient createNewNetworkModuleClient() {
        return new OkHttpClient.Builder()
                .callTimeout(60000, TimeUnit.MILLISECONDS)
                .readTimeout(0, TimeUnit.MILLISECONDS)
                .writeTimeout(0, TimeUnit.MILLISECONDS)
                .connectTimeout(0, TimeUnit.MILLISECONDS)
                .cookieJar(new ReactCookieJarContainer())
                .dispatcher(createDispatcher())
                .connectionPool(createConnectionPool())
                .build();
    }

    private static Dispatcher createDispatcher() {
        final Dispatcher dispatcher = new Dispatcher(Executors.newCachedThreadPool());
        dispatcher.setMaxRequests(MAX_REQUEST_NUMBER_PER_HOST);
        dispatcher.setMaxRequestsPerHost(MAX_REQUEST_NUMBER_PER_HOST);
        return dispatcher;
    }

    private static ConnectionPool createConnectionPool() {
        return new ConnectionPool(MAX_REQUEST_NUMBER_PER_HOST, 10000, TimeUnit.MILLISECONDS);
    }
}
