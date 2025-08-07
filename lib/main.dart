import 'package:flutter/material.dart';
import 'dart:math';
import 'package:google_fonts/google_fonts.dart';

void main() {
  runApp(const ChemoDosageCalculatorApp());
}

class ChemoDosageCalculatorApp extends StatelessWidget {
  const ChemoDosageCalculatorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BMTrix',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
        // Using a custom font from google_fonts for the whole app theme
        textTheme: GoogleFonts.jetBrainsMonoTextTheme(
          Theme.of(context).textTheme,
        ),
      ),
      home: const CalculatorScreen(),
      debugShowCheckedModeBanner: false, // Remove the debug banner
    );
  }
}

class CalculatorScreen extends StatefulWidget {
  const CalculatorScreen({super.key});

  @override
  State<CalculatorScreen> createState() => _CalculatorScreenState();
}

class _CalculatorScreenState extends State<CalculatorScreen>
    with TickerProviderStateMixin {
  final TextEditingController _heightController = TextEditingController();
  final TextEditingController _weightController = TextEditingController();
  final TextEditingController _dosePerBsaController = TextEditingController();

  double _bsa = 0.0;
  double _finalDosage = 0.0;

  late AnimationController _opacityController;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _opacityController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _opacityAnimation = Tween<double>(
      begin: 1.0,
      end: 0.0,
    ).animate(_opacityController);

    // The _updateCalculations method is called by the onChanged callbacks of the TextFields.
    // No need for addListener here, as it would cause redundant calls.
  }

  // Unified method to recalculate BSA and Final Dosage
  void _updateCalculations() {
    setState(() {
      final double height = double.tryParse(_heightController.text) ?? 0.0;
      final double weight = double.tryParse(_weightController.text) ?? 0.0;
      final double dosePerBsa =
          double.tryParse(_dosePerBsaController.text) ?? 0.0;

      if (height > 0 && weight > 0) {
        _bsa = sqrt((height * weight) / 3600); // Mosteller formula
      } else {
        _bsa = 0.0;
      }

      if (_bsa > 0 && dosePerBsa > 0) {
        _finalDosage = _bsa * dosePerBsa;
      } else {
        _finalDosage = 0.0;
      }
    });
  }

  // Clears all input fields and calculated results with a fade effect
  void _clearAllFields() async {
    // Fade out current values
    await _opacityController.forward();

    // After fade-out, clear the input fields and reset calculation results
    setState(() {
      _heightController.clear();
      _weightController.clear();
      _dosePerBsaController.clear();
      _bsa = 0.0;
      _finalDosage = 0.0;
    });

    // Fade in cleared (0.00) values
    await _opacityController.reverse();
  }

  @override
  void dispose() {
    // Listeners were not added in initState, so no need to remove them here.
    _heightController.dispose();
    _weightController.dispose();
    _dosePerBsaController.dispose();
    _opacityController.dispose(); // Dispose the animation controller
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'BMTrix',
          style: GoogleFonts.jetBrainsMono(
            fontWeight: FontWeight.bold,
            fontSize: 20.0,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Row(
              children: <Widget>[
                Expanded(
                  child: TextField(
                    controller: _heightController,
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    decoration: const InputDecoration(
                      labelText: 'Height (cm)',
                      border: OutlineInputBorder(),
                      hintText: 'Enter height',
                    ),
                    onChanged: (_) =>
                        _updateCalculations(), // Triggers calculation on input change
                  ),
                ),
                const SizedBox(width: 16.0),
                Expanded(
                  child: TextField(
                    controller: _weightController,
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    decoration: const InputDecoration(
                      labelText: 'Weight (kg)',
                      border: OutlineInputBorder(),
                      hintText: 'Enter weight',
                    ),
                    onChanged: (_) =>
                        _updateCalculations(), // Triggers calculation on input change
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24.0),
            Container(
              padding: const EdgeInsets.all(12.0),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(4.0),
                color: Colors.grey.shade50,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const Text(
                    'BSA (m²)',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8.0),
                  AnimatedBuilder(
                    animation: _opacityAnimation,
                    builder: (BuildContext context, Widget? child) {
                      return Opacity(
                        opacity: _opacityAnimation.value,
                        child: Text(
                          _bsa > 0 ? _bsa.toStringAsFixed(4) : '0.0000',
                          style: const TextStyle(fontSize: 18.0),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16.0),
            TextField(
              controller: _dosePerBsaController,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: const InputDecoration(
                labelText: 'Dose per BSA (mg/m²)',
                border: OutlineInputBorder(),
                hintText: 'Enter dose per BSA',
              ),
              onChanged: (_) =>
                  _updateCalculations(), // Triggers calculation on input change
            ),
            const SizedBox(height: 24.0),
            Container(
              padding: const EdgeInsets.all(12.0),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(4.0),
                color: Colors.blue.shade50,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const Text(
                    'Final Dosage (mg)',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8.0),
                  AnimatedBuilder(
                    animation: _opacityAnimation,
                    builder: (BuildContext context, Widget? child) {
                      return Opacity(
                        opacity: _opacityAnimation.value,
                        child: Text(
                          _finalDosage > 0
                              ? _finalDosage.toStringAsFixed(2)
                              : '0.00',
                          style: const TextStyle(
                            fontSize: 18.0,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24.0),
            Center(
              child: SizedBox(
                width: 36.3, // Calculated size based on icon size
                height: 36.3, // Calculated size based on icon size
                child: ElevatedButton(
                  onPressed: _clearAllFields,
                  style: ElevatedButton.styleFrom(
                    shape: const CircleBorder(),
                    padding: EdgeInsets
                        .zero, // Keep padding zero for a tight circular button
                  ),
                  child: const Icon(
                    Icons.refresh,
                    size: 23.76, // Calculated icon size
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
