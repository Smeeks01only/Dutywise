from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from tariffs.models import HSCode
from .models import SavedCalculation

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Check if email is already used
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "User with this email already exists."})
            
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['email'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class SavedCalculationSerializer(serializers.ModelSerializer):
    hs_code_value = serializers.CharField(source='hs_code.code', read_only=True)
    
    class Meta:
        model = SavedCalculation
        fields = ('id', 'hs_code', 'hs_code_value', 'input_snapshot', 'result_snapshot', 'created_at')
        read_only_fields = ('id', 'created_at')

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'date_joined')
        read_only_fields = ('id', 'date_joined')

    def validate_email(self, value):
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value

    def update(self, instance, validated_data):
        if 'email' in validated_data:
            instance.email = validated_data['email']
            instance.username = validated_data['email']  # keep username in sync
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs
