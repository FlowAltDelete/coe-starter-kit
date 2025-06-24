"use strict";
import { Config } from '../../src/common/config';


describe('Config', () => {
    test('Environment value', async () => {

        // Arrange
        const originalTemp = process.env.TEMP
        process.env.TEMP = originalTemp || '/tmp'
        Config.data = { "temp": "{env:TEMP}" }

        // Act
        await Config.init()

        // Assert
        expect(Config.data.temp).toBe(process.env.TEMP)
        process.env.TEMP = originalTemp
    })

    test('Missing environment allowed', async () => {

        // Arrange
        const originalMissing = process.env.MISSING_VAR
        delete process.env.MISSING_VAR
        Config.configSetup = false
        Config.data = { "value": "{env:MISSING_VAR}", failOnMissingEnv: false }

        // Act
        await Config.init()

        // Assert
        expect(Config.data.value).toBe("")
        if (originalMissing) process.env.MISSING_VAR = originalMissing
    })

    test('Missing environment throws', async () => {

        // Arrange
        const originalMissing = process.env.MISSING_VAR
        delete process.env.MISSING_VAR
        Config.configSetup = false
        Config.data = { "value": "{env:MISSING_VAR}", failOnMissingEnv: true }

        // Act/Assert
        await expect(Config.init()).rejects.toThrow('Environment variable MISSING_VAR not found')
        if (originalMissing) process.env.MISSING_VAR = originalMissing
    })

    test('Config replacement', async () => {

        // Arrange
        let data = { "value1": "ABC", "value2": "[{config:value1}]" }

        // Act
        await Config.replaceValues(data)

        // Assert
        expect(data.value2).toBe("[ABC]")
    })

    test('Config child replacement', async () => {

        // Arrange
        let data = { "value1": "ABC", "child": { "value2": "[{config:value1}]" } }

        // Act
        await Config.replaceValues(data)

        // Assert
        expect(data.child.value2).toBe("[ABC]")
    })

    test('Copy values - Replace', async () => {

        // Arrange
        let data = { "value1": "ABC" }

        // Act
        await Config.copyValue({ "value1": "123"}, data, "value1" )

        // Assert
        expect(data.value1).toBe("123")
    })

    test('Copy values - Replace Child', async () => {

        // Arrange
        let data : any = { "value1": "ABC" }

        // Act
        await Config.copyValue({ "child": { "other": "123" } }, data, "child" )

        // Assert
        expect(data.child.other).toBe("123")
    })
})

