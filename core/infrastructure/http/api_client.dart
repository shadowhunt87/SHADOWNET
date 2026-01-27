import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  final Dio dio;
  final FlutterSecureStorage storage;

  ApiClient(this.storage)
      : dio = Dio(
          BaseOptions(
            // ✅ Cambiado a Render
            baseUrl: 'https://shadownet.onrender.com/api',
            connectTimeout:
                const Duration(seconds: 30), // Aumentado para Render
            receiveTimeout: const Duration(seconds: 30),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          ),
        ) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          print('📤 Request: ${options.method} ${options.path}');
          final token = await storage.read(key: 'jwt_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onResponse: (response, handler) {
          print(
              '✅ Response: ${response.statusCode} ${response.requestOptions.path}');
          return handler.next(response);
        },
        onError: (error, handler) {
          print('❌ HTTP Error: ${error.message}');
          return handler.next(error);
        },
      ),
    );
  }

  Future<Response> get(String path) => dio.get(path);
  Future<Response> post(String path, {dynamic data}) =>
      dio.post(path, data: data);
  Future<Response> put(String path, {dynamic data}) =>
      dio.put(path, data: data);
  Future<Response> delete(String path) => dio.delete(path);
  Future<Response> patch(String path, {dynamic data}) =>
      dio.patch(path, data: data);
}
