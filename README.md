# vscode-pweave README

This extension gives support for [Pweave](http://mpastell.com/pweave/docs.html) files, namely formatting and building.

## Features

For the moment, this extension only supports LaTeX Pweave files using **noweb** syntax.

*Example*

```latex
\documentclass{article}

\begin{document}

This functions calculates the gcd of two integers.

<<>>=
def gcd(a, b):
    while b!=0:
        a, b = b, a % b
    return a
@

\end{document}

```

### Formatting

Formatting is achieved with <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>f</kbd>. It uses `autopep8` for python formatting and `latexindent` for LaTeX formatting.

### Building

Building is achieved with <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>b</kbd>. It generates a LaTeX file. By default, Python code is rendered with `verbatim` environments. This behaviour can be changed by modifying the `pweaveOutputFormat` variable in the extension settings. Accepted values are `tex`, `texminted` and `texpygments` (cf. [Output Formats](http://mpastell.com/pweave/formats.html) in Pweave documentation).

One can also changes the defaut behaviour by adding a *magic comment* in the Pweave LaTeX file.

```latex
%!TeX pweaveOutputFormat=tex
```

```latex
%!TeX pweaveOutputFormat=texminted
```

```latex
%!TeX pweaveOutputFormat=texpygments
```

### Showing

<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>v</kbd> displays the generated LaTeX file in a pane beside the active editor.

## Requirements

* `autopep8`

This can be installed via `pip`.

```cmd
pip install autopep8
```

* `latexindent`

This executable is usually included in common LaTeX distributions butcan also be downloaded from https://ctan.org/pkg/latexindent.

* `pweave`

This can be installed via `pip`.

```cmd
pip install pweave
```

## Extension Settings

This extension contributes the following settings:

* `vscode-pweave.autopep8Path`: path of the `autopep8` executable. Defaults to `autopep8`.
* `vscode-pweave.latexindentPath`: path of the `latexindent` executable. Defaults to `latexindent`.
* `vscode-pweave.pweavePath`: path of the `pweave` executable. Defaults to `pweave`.
* `vscode-pweave.pweaveOutputFormat` : Pweave output format : `'tex'` or `'texminted'` or `'texpygments'`.

## Known Issues

This extension does not yet provide autocompletion. This is on the todo list.
