package io.verida.vault;

import com.facebook.react.modules.network.OkHttpClientFactory;
import com.facebook.react.modules.network.ReactCookieJarContainer;

import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import okhttp3.ConnectionPool;
import okhttp3.Dispatcher;
import okhttp3.OkHttpClient;

class CustomNetworkModule implements OkHttpClientFactory {
    public OkHttpClient createNewNetworkModuleClient() {
        return new OkHttpClient.Builder()
                .cookieJar(new ReactCookieJarContainer())
                .dispatcher(createDispatcher())
                .connectionPool(createConnectionPool())
                .build();
    }


    private static Dispatcher createDispatcher() {
        final Dispatcher dispatcher = new Dispatcher(Executors.newCachedThreadPool());
        dispatcher.setMaxRequests(64);
        dispatcher.setMaxRequestsPerHost(64);
        return dispatcher;
    }

    private static ConnectionPool createConnectionPool() {
        return new ConnectionPool(64, 10000, TimeUnit.MILLISECONDS);
    }
}