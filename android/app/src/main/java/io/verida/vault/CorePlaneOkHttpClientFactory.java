package io.verida.vault;// Customize OkHttp to add IPv4 DNS preference

import com.facebook.react.modules.network.OkHttpClientProvider;
import com.facebook.react.modules.network.OkHttpClientFactory;
import okhttp3.OkHttpClient;

public class CorePlaneOkHttpClientFactory implements OkHttpClientFactory {
    public OkHttpClient createNewNetworkModuleClient() {
        return OkHttpClientProvider.createClientBuilder()
            .dns(new CorePlaneOkHttpDNSSelector(CorePlaneOkHttpDNSSelector.IPvMode.IPV4_FIRST))
            .build();
    }
}